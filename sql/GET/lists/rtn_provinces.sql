CREATE OR REPLACE FUNCTION public.rtn_provinces()
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(tx))) provinces
	FROM(
		SELECT 
		a.id,
		a.name_en AS "value"
		FROM matview_cda_provinces a
		ORDER BY a.id
	) tx

$function$;