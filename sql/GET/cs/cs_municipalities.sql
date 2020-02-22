DROP FUNCTION IF EXISTS public.cs_municipalities(
	_params text
);

CREATE OR REPLACE FUNCTION public.cs_municipalities(
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
			|| ' FROM (SELECT DISTINCT ON (a.township)'
			|| ' a.township'
			|| ', CONCAT(INITCAP(LOWER(a.township)), '' '', UPPER(b.iso)) AS "value"'
			|| ', ''text'' AS "type"'
			|| ', ''city'' AS "field" '
			|| ' FROM sys_municipalities a' 
			|| ' LEFT JOIN sys_provinces b ON b.id = a.province_id'
			|| ' WHERE a.township  ~* '
			|| quote_literal(_params)
			|| ') t;';
    
		RETURN QUERY EXECUTE sql;

	END;

$function$;

SELECT * FROM public.cs_municipalities('^van') AS result;