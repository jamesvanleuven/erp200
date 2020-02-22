DROP VIEW IF EXISTS rtn_orders;

DROP FUNCTION IF EXISTS rtn_orders_view(
	integer,
	integer,
	integer,
	integer[],
	integer[],
	integer,
	integer,
	character varying,
	timestamp without time zone,
	timestamp without time zone
);

CREATE OR REPLACE FUNCTION rtn_orders_view(
    _limit integer, 
    _offset integer, 
    _establishment integer, 
    _manufacturers integer[], 
    _locations integer[], 
    _location integer, 
	_module integer,
    _filter character varying,
	_startdate timestamp without time zone,
	_enddate timestamp without time zone
)  RETURNS TABLE (
	id bigint,
	order_number bigint,
	order_reference text,
	user_id bigint,
	created_by text,
	customer_id bigint,
	customers character varying,
	manufacturer_id bigint,
	manufacturers character varying,
	location_id bigint,
	locations character varying, -- location
	paid boolean,
	rush boolean,
	pickup boolean,
	status_id bigint,
	statuses character varying,
	delivered text,
	created text
--	order_age text -- age from today when this order was created
)
 LANGUAGE plpgsql
AS $function$ 

DECLARE
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_establishment ALIAS FOR $3;
	_manufacturers ALIAS FOR $4;
	_locations ALIAS FOR $5;
	_location ALIAS FOR $6;
	_module ALIAS FOR $7;
	_filter ALIAS FOR $8;
	_startdate ALIAS FOR $9;
	_enddate ALIAS FOR $10;
	sql character varying;

	BEGIN
	
		sql := '	SELECT a.id,';
		sql := sql || ' a.id AS "order_number",'; 
		sql := sql || ' COALESCE(NULLIF(a.udf_reference, NULL), '' Not Defined '') AS "order_reference",';
		sql := sql || ' a.user_id,';
		sql := sql || ' (SELECT CONCAT(b.firstname, '' '', b.lastname) FROM crm_users b WHERE b.id = a.user_id) AS "created_by",';
		sql := sql || ' a.customer_id,';
		sql := sql || ' (SELECT c.customers FROM matview_customers c WHERE c.id = a.customer_id) AS "customers",';
		sql := sql || ' a.manufacturer_id,';
		sql := sql || ' (SELECT d.manufacturers FROM matview_manufacturers d WHERE d.id = a.manufacturer_id) AS "manufacturers",';
		sql := sql || ' a.location_id,';
		sql := sql || ' (SELECT e.locations FROM matview_locations e WHERE e.id = a.location_id) AS "locations",';
		sql := sql || ' a.paid,';
		sql := sql || ' a.rush,';
		sql := sql || ' a.pickup,';
		sql := sql || ' a.status_id,';
		sql := sql || ' (SELECT f.name FROM pim_statuses f WHERE f.id = a.status_id) AS "statuses",';
		sql := sql || ' to_char(a.delivery_date at time zone ''UTC'', ''YYYY-MM-DD"T"HH24:MI:SS"Z"'') AS "delivered",';
		sql := sql || ' to_char(a.created at time zone ''UTC'', ''YYYY-MM-DD"T"HH24:MI:SS"Z"'') AS "created"';
		sql := sql || ' FROM pim_orders a WHERE ';

		IF _establishment > 0 THEN
			sql := sql || ' a.manufacturer_id = ''' || _establishment || ''' AND ';
		END IF; 
        
	-- HAS DEFAULT STARTDATE
		IF _startdate IS NOT NULL THEN
			sql := sql || ' DATE(a.created) >= DATE(''' || _startdate || ''')';
		ELSE 
			sql := sql || ' DATE(a.created) >= CURRENT_DATE - INTERVAL ''2 WEEK''';
		END IF;

	-- HAS DEFAULT ENDDATE
		IF _enddate IS NOT NULL THEN
			sql := sql || ' AND DATE(a.created) <= DATE(''' || _enddate || ''')';
		ELSE 
			sql := sql || ' AND DATE(a.created) <= CURRENT_DATE + INTERVAL ''2 WEEK''';
		END IF;

	-- HAS FILTER
		IF _filter IS NOT NULL THEN
			sql := sql || _filter;
		END IF;
	
		sql := sql || ' ORDER BY a.created DESC OFFSET ' || _offset || ' LIMIT ' || _limit || ';';
	
		RETURN QUERY EXECUTE sql;

	END;

$function$;

CREATE OR REPLACE FUNCTION public.rtn_orders(
	_limit integer, 
	_offset integer, 
	_establishment integer, 
	_manufacturers integer[], 
	_locations integer[], 
	_location integer, 
	_module integer, 
	_filter character varying, 
	_startdate timestamp without time zone, 
	_enddate timestamp without time zone
) RETURNS TABLE(orders json) LANGUAGE plpgsql
AS $function$ 

	BEGIN

		PERFORM rtn_orders_view(_limit, _offset, _establishment, _manufacturers, _locations, _location, _module, _filter, _startdate, _enddate);

		RETURN QUERY (
			SELECT array_to_json(array_agg(row_to_json(t))) 
			FROM (
				SELECT 
					id,
					(SELECT * FROM rtn_element_bigint('34'::bigint, order_number::bigint)) AS "order_number", 
					(SELECT * FROM rtn_element_text('35'::bigint, order_reference::text)) AS "order_reference",
					(SELECT * FROM rtn_element_select('37'::bigint, customers::text, customer_id::bigint)) AS "customers",
					(SELECT * FROM rtn_element_select('38'::bigint, manufacturers::text, manufacturer_id::bigint)) AS "manufacturers",
					(SELECT * FROM rtn_element_select('39'::bigint, locations::text, location_id::bigint)) AS "locations",
					(SELECT * FROM rtn_element_select('36'::bigint, created_by::text, user_id::bigint)) AS "created_by",
					(SELECT * FROM rtn_element_text('45'::bigint, created::text)) AS "created",
					(SELECT * FROM rtn_element_text('44'::bigint, delivered::text)) AS "delivered",
					(SELECT * FROM rtn_element_boolean('40'::bigint,paid::boolean)) AS "paid",
					(SELECT * FROM rtn_element_boolean('41'::bigint,rush::boolean)) AS "rush",
					(SELECT * FROM rtn_element_boolean('42'::bigint,pickup::boolean)) AS "pickup",
					(SELECT * FROM rtn_element_select('43'::bigint, statuses::text, status_id::bigint)) AS "statuses",
					(
					SELECT COUNT(*) 
					FROM pim_orders 
						WHERE 
							(
								CASE 
									WHEN _startdate IS NOT NULL THEN DATE(created) >= DATE(_startdate)
									ELSE DATE(created) >= CURRENT_DATE - INTERVAL '2 WEEKS'
								END
							)
						AND 
							(
								CASE
									WHEN _enddate IS NOT NULL THEN DATE(created) <= DATE(_enddate) 
									ELSE DATE(created) <= CURRENT_DATE + INTERVAL '2 WEEKS' 
								END
							)
						AND 
							(
								CASE
									WHEN _establishment > 0 THEN manufacturer_id = _establishment
								END
							)
					) AS "totalRecords"
				FROM rtn_orders_view(
					_limit, 
					_offset, 
					_establishment, 
					ARRAY[_manufacturers]::integer[], 
					ARRAY[_locations]::integer[], 
					_location,
					_module,
					_filter,
					_startdate,
					_enddate
				)
			) t
		);
END;
$function$;

SELECT * FROM rtn_orders(25, 0, 362, ARRAY[362]::integer[], ARRAY[1,2,3,5]::integer[], 1, 4, NULL, NULL, NULL) AS "orders";