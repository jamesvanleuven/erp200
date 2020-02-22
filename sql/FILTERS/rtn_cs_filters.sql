DROP FUNCTION IF EXISTS public.cs_filter(text, text, text);

CREATE OR REPLACE FUNCTION public.cs_filter(
	_field text
	, _module text
	, _params text
) RETURNS TABLE(
	result json
) LANGUAGE plpgsql
AS $function$ 
DECLARE 
	_field ALIAS FOR $1;
	_module ALIAS FOR $2;
	_params ALIAS FOR $3;
	sql character varying;

BEGIN

	sql := 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (SELECT a.id, a.'
		|| _field
		|| ' AS value, a.delivery_days, a.license_number, ';
		
		IF _field = 'manufacturers' THEN sql := sql || '''manufacturer'' AS field'; END IF;
		IF _field = 'customers' THEN sql := sql || '''customer'' AS field'; END IF;
		
	sql := sql || ', ''text'' AS type, (SELECT row_to_json(aa) FROM (SELECT'
		|| ' (SELECT row_to_json(s) FROM (SELECT a.address_id AS id, a.street AS value) s) AS street'
		|| ', (SELECT row_to_json(c) FROM (SELECT a.city_id AS id, a.city AS value) c) AS city'
		|| ', (SELECT row_to_json(c) FROM (SELECT a.state_id AS id, a.state AS value) c) AS state' 
		|| ', a.zipcode AS zipcode) aa) AS address'
		|| ', (SELECT * FROM rtn_element_cs(';
	
	IF _field = 'manufacturers' THEN sql := sql || '''38'''; END IF;
	IF _field = 'customers' THEN sql := sql || '''37'''; END IF;
	
	sql := sql || '::bigint' 
		|| ', INITCAP(LOWER(a.' 
		|| _field 
		|| '))::text, a.id::bigint)) AS schema' 
		|| ' FROM matview_' 
		|| _field 
		|| ' AS a'
		|| ' WHERE a.' 
		|| _field 
		|| ' ILIKE ''%' 
		|| _params 
		|| '%'') t;';

    RETURN QUERY EXECUTE sql;

END;

$function$;

SELECT * FROM cs_filter('manufacturers', 'orders', 'mac');