CREATE OR REPLACE FUNCTION public.rtn_customers_global(
	_location integer,
	_filter text
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_location ALIAS FOR $1;
	_filter ALIAS FOR $2;
	sql character varying;

	BEGIN
    
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_customers;

    sql := 'SELECT array_to_json(array_agg(row_to_json(t))) FROM ('
				||  ' SELECT a.id, a.location_id, a.key AS channel,'
        || ' (SELECT *  FROM rtn_element_integer(1::bigint, a.license_number::integer)) AS license_number,'
        || ' (SELECT * FROM rtn_element_text(9::bigint,a.customers::text)) AS customer,'
        || ' (SELECT * FROM rtn_element_select(3::bigint, a.customer_types::text, a.customer_type_id::bigint) ) AS customer_type,'
        || ' (SELECT * FROM rtn_element_select(4::bigint, a.license_types::text, a.license_type_id::bigint) ) AS license_type,'
        || ' (SELECT * FROM rtn_element_select(10::bigint, a.city::text, a.city_id::bigint)) AS municipalities,'
        || ' (SELECT * FROM rtn_element_text(66::bigint, a.address::text)) AS address,'
        || ' (SELECT row_to_json(t) FROM (SELECT * FROM matview_addresses WHERE establishment_id = a.id) t) AS full_address,'
        || ' (SELECT * FROM rtn_element_datetime(67::bigint, a.opens::text)) AS opens_at,'
        || ' (SELECT * FROM rtn_element_datetime(68::bigint, a.closes::text)) AS closes_at,'
        || ' (SELECT * FROM rtn_text_array(69::bigint, a.delivery_days::text[])) AS delivery_days,'
        || ' (SELECT * FROM rtn_element_json(70::bigint, a.notes::json)) AS notes,'
        || ' (SELECT count(c.*) FROM matview_customers c WHERE c.location_id @> ARRAY[' 
        || _location
        || ']::integer[] AND c.active = true) AS totalRecords'
        || ', a.created, a.active'
        || ' FROM matview_customers a WHERE ('
        || '(a.customers::text ~* '''
        || _filter 
        || ''' AND a.city::text ~* '''
        || _filter
        || ''') OR (a.license_number::text ~* '''
        || _filter
        || ''') AND (a.active = true)) ORDER BY a.customers, a.city, a.license_number'
				|| ') t;';
    
    RETURN QUERY EXECUTE sql;

	END;


$function$;

-- SELECT * FROM rtn_customers_global('1','104337|aLtA\sbIsTrO|nOrTh\sVaNcOuVeR'::text);

/*
EXPLAIN ANALYZE SELECT * FROM rtn_customers_global('1','^[original joe|$kelowna].*'::text);

EXPLAIN ANALYZE SELECT * FROM matview_customers 
WHERE customers ILIKE 'original joe%' AND city ILIKE 'Kelowna%';

EXPLAIN ANALYZE SELECT * FROM matview_customers 
WHERE customers ~* '^[original joe|$kelowna].*' AND city ~* '^[original joe|$kelowna].*';
*/