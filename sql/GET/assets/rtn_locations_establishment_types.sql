CREATE OR REPLACE FUNCTION public.rtn_location_establishment_types(_establishment_types integer[])
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(xx)))
	FROM (
		SELECT
			a.id,
			a.name AS "value"
		FROM unnest(ARRAY[_establishment_types]::integer[]) id(id)
		LEFT OUTER JOIN crm_establishment_types a ON a.id = id.id
		ORDER BY a.id LIMIT 100
	) xx

$function$;