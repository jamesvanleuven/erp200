DROP FUNCTION IF EXISTS public.cs_select_provinces(
	_params text
);

CREATE OR REPLACE FUNCTION public.cs_select_provinces(
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
			|| 'FROM (SELECT a.id, INITCAP(LOWER(a.name_en)) AS value, a.iso AS abbr'
			|| ' FROM sys_provinces a'
			|| ' WHERE ('
			|| '(a.name_en::text ~* ' || quote_literal(_params) || ')'
			|| ' OR (a.iso::text ~* ' || quote_literal(_params) || ')'
			|| ')'
			|| ')t;';
    
		RETURN QUERY EXECUTE sql;

	END;

$function$;

SELECT * FROM cs_select_provinces( 'british' );