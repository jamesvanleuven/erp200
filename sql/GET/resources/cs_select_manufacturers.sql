CREATE OR REPLACE FUNCTION public.cs_select_manufacturers(
	_location integer, 
	_param1 text, 
	_param2 text
) RETURNS TABLE (result json) 
LANGUAGE plpgsql
AS $function$ 
DECLARE 
	_location ALIAS FOR $1;
	_param1 ALIAS FOR $2;
	_param2 ALIAS FOR $3;
	sql character varying;

	BEGIN

		REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_manufacturers;

		sql := 'SELECT array_to_json(array_agg(row_to_json(t)))'
				|| 'FROM (SELECT a.id, a.key, INITCAP(LOWER(a.manufacturers)) AS value'
				|| ', a.license_number, a.store_number, a.address, a.city, a.zipcode, a.opens, a.closes'
				|| ', a.delivery_days FROM matview_manufacturers a';

		IF _param2 IS NOT NULL THEN

			sql := sql || ' WHERE ('
				|| '(INITCAP(LOWER(a.manufacturers::text)) ~* ' || quote_literal(_param1) || ') AND ('
				|| '(a.city::text ~* ' || quote_literal(_param2) || ') OR'
				|| ' (a.store_number::text ~* ' || quote_literal(_param2) || ') OR'
				|| ' (a.license_number::text ~* ' || quote_literal(_param2) || ')'
				|| ')';

		ELSE

			sql := sql || ' WHERE ('
				|| '(INITCAP(LOWER(a.manufacturers))::text ~* ' || quote_literal(_param1) || ') OR'
				|| ' (a.city::text ~* ' || quote_literal(_param1) || ') OR'
				|| ' (a.store_number::text ~* ' || quote_literal(_param1) || ') OR'
				|| ' (a.license_number::text ~* ' || quote_literal(_param1) || ')';

		END IF;

			sql := sql || ' AND (a.active = true)) ORDER BY a.manufacturers, a.city, a.license_number)t;';
    
		RETURN QUERY EXECUTE sql;

	END;

$function$;