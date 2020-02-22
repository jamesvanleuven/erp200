DROP FUNCTION IF EXISTS public.rtn_orders_view(
	_limit integer
	, _offset integer
	, _establishment integer
	, _location integer
	, _filter character varying
);

CREATE OR REPLACE FUNCTION public.rtn_orders_view(
	_limit integer
	, _offset integer
	, _establishment integer
	, _location integer
	, _filter character varying
) RETURNS TABLE(
	id bigint
	, order_number bigint
	, order_reference text
	, user_id bigint
	, created_by text
	, license_number bigint
	, customer_id bigint
	, customer text
	, customer_type_id bigint
	, customer_type text
	, customer_abbr text
	, address_id bigint
	, address text
	, city_id bigint
	, city text
	, manufacturer_id bigint
	, manufacturer text
	, location_id bigint
	, location text
	, products json
	, notes json
	, paid boolean
	, promo boolean
	, rush boolean
	, pickup boolean
	, status_id bigint
	, status text
	, "deliver_date" text
	, "create_date" text
)
 LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_limit ALIAS FOR $1; 
	_offset ALIAS FOR $2; 
	_establishment ALIAS FOR $3; 
	_location ALIAS FOR $4; 
	_filter ALIAS FOR $5; 
	sql character varying; 
    
	BEGIN 

        sql := 'SELECT a.id,'
			|| ' a.order_number,'
			|| ' a.order_reference::text,'
			|| ' a.user_id,' 
			|| ' (SELECT CONCAT(b.firstname, '' '', b.lastname)::text FROM crm_users b'
			|| ' WHERE b.id = a.user_id) AS created_by,'
			|| ' a.license_number,'
			|| ' a.customer_id,' 
			|| ' (SELECT c.customers::text FROM matview_customers c WHERE c.id = a.customer_id) AS customer,'
			|| ' a.customer_type_id,' 
			|| ' a.customer_type::text,'
			|| ' a.customer_abbr::text,'
			|| ' (SELECT f.address_id::bigint FROM matview_customers f WHERE f.id = a.customer_id) AS address_id,'
			|| ' (SELECT CONCAT(f.address, '' '', f.zipcode)::text FROM matview_customers f WHERE f.id = a.customer_id) AS address,'
			|| ' (SELECT f.city_id::bigint FROM matview_customers f WHERE f.id = a.customer_id) AS city_id,'
			|| ' (SELECT f.city::text FROM matview_customers f WHERE f.id = a.customer_id) AS city,'
			|| ' a.manufacturer_id,' 
			|| ' (SELECT d.manufacturers::text FROM matview_manufacturers d WHERE d.id = a.manufacturer_id) AS manufacturer,'
			|| ' a.location_id,' 
			|| ' (SELECT e.name::text FROM matview_locations e WHERE e.id = a.location_id) AS location,'
			|| ' a.products,' 
			|| ' a.notes,'
			|| ' a.paid,'
			|| ' a.promo,'
			|| ' a.rush,'
			|| ' a.pickup,'
			|| ' a.status_id,' 
			|| ' (SELECT f.name::text FROM pim_statuses f WHERE f.id = a.status_id) AS status,' 
			|| ' to_char(a.delivery_date, ''YYYY-MM-DD HH24:MI:SS '') AS "deliver_date",'
			|| ' to_char(a.created, ''YYYY-MM-DD HH24:MI:SS'') AS "create_date"'
			|| ' FROM matview_orders a WHERE '; 
            
       -- LOCATIONS
		IF _location > 0 THEN 
			sql := sql || ' a.location_id = ' || quote_literal(_location); 
		END IF; 
		
		-- MANUFACTURERS
		IF _establishment > 0 THEN 
			sql := sql || ' AND a.manufacturer_id = ' || quote_literal(_establishment); 
		END IF; 

		IF _filter IS NOT NULL THEN
			sql := sql ||  _filter || ' ORDER BY a.created Desc';
		ELSE
			sql := sql || ' ORDER BY a.created Desc';
		END IF;
		
		IF _limit IS NOT NULL OR _limit > 0 THEN
			sql := sql || ' OFFSET ' 
				|| _offset
				|| ' FETCH NEXT ' 
				|| _limit 
				|| ' ROWS ONLY;';
		ELSE
			sql := sql || ';';
		END IF;
    		
		RETURN QUERY EXECUTE sql; 
	END;
 
$function$;

SELECT * FROM rtn_orders_view(25, 0, 0, 1, NULL);
