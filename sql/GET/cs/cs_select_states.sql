DROP FUNCTION IF EXISTS public.cs_select_states(
	_params text
);

CREATE OR REPLACE FUNCTION public.cs_select_states(
	_params text
) RETURNS TABLE (
 	result json
) LANGUAGE plpgsql
AS $function$ 
DECLARE 
	_params ALIAS FOR $1;
	sql character varying;

	BEGIN

		sql := 'SELECT array_to_json(array_agg(row_to_json(t)))'
			|| 'FROM (SELECT a.id, INITCAP(LOWER(a.township)) AS value, a.type'
			|| ', b.id AS province_id, b.name_en, b.name_fr, b.iso'
			|| ' FROM sys_municipalities a'
			|| ' LEFT JOIN sys_provinces b ON b.id = a.province_id'
			|| ' WHERE ((a.township::text ~* ' 
			|| quote_literal(_params) 
			|| ')))t;';
    
		RETURN QUERY EXECUTE sql;

	END;

$function$;

SELECT * FROM cs_select_states('kel');
