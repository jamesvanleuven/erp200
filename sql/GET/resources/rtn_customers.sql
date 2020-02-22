DROP FUNCTION IF EXISTS public.rtn_customers(
	_limit integer
	, _offset integer
	, _filter character varying
);

CREATE OR REPLACE FUNCTION public.rtn_customers(
	_limit integer
	, _offset integer
	, _filter character varying
) RETURNS TABLE (
	result json
) LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_filter ALIAS FOR $3;
	sql character varying;

BEGIN

    REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_customers;

	sql := 'SELECT array_to_json(array_agg(row_to_json(t)))'
		|| ' FROM (SELECT a.id, a.location_id, a.key AS channel,'
		|| ' (SELECT *  FROM rtn_element_text(1::bigint, a.license_number::text)) AS license_number,'
		|| ' (SELECT * FROM rtn_element_text(9::bigint,a.customers::text)) AS customer,'
		|| ' (SELECT * FROM rtn_element_select(81::bigint, a.customer_types::text, a.customer_type_id::bigint) ) AS customer_type,'
		|| ' (SELECT * FROM rtn_element_select(4::bigint, a.license_types::text, a.license_type_id::bigint) ) AS license_type,'
		|| ' (SELECT * FROM rtn_element_text(66::bigint, a.address::text)) AS address,'
		|| ' (SELECT * FROM rtn_element_select(11::bigint, a.state::text, a.state_id::bigint)) AS provinces,'
		|| ' (SELECT * FROM rtn_element_select(74::bigint, a.city::text, a.city_id::bigint)) AS city,'
		|| ' (SELECT row_to_json(t) FROM ( SELECT aa.address_id, aa.street, aa.city_id, aa.city AS township,'
		|| ' aa.state_id, aa.state AS province, aa.zipcode FROM matview_customers aa WHERE aa.id = a.id) t ) AS "full_address",'
		|| ' (SELECT * FROM rtn_element_datetime(67::bigint, a.opens::text)) AS opens_at,'
		|| ' (SELECT * FROM rtn_element_datetime(68::bigint, a.closes::text)) AS closes_at,'
		|| ' (SELECT * FROM rtn_element_json(69::bigint, a.delivery_days::json)) AS delivery_days,'
		|| ' (SELECT * FROM rtn_element_json(70::bigint, a.notes::json)) AS notes,'
		|| ' a.created, a.active FROM matview_customers a WHERE a.active = true ';

    IF _filter IS NOT NULL THEN
		sql := sql || ' ' 
			|| _filter
			|| ' ORDER BY a.id Desc OFFSET '
			|| _offset
			|| ' FETCH NEXT '
			|| _limit
			|| ' ROWS ONLY) t;';
    ELSE
		sql := sql || ' ORDER BY a.id Desc OFFSET '
			|| _offset
			|| ' FETCH NEXT '
			|| _limit
			|| ' ROWS ONLY) t;';
    END IF;

    RETURN QUERY EXECUTE sql;

END;

$function$;