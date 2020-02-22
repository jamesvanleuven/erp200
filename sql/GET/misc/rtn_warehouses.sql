CREATE OR REPLACE FUNCTION public.rtn_warehouses(_warehouses integer[])
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(xx)))
	FROM (
		SELECT 
			a.id,
			a.locations AS "value"
		FROM unnest(Array[_warehouses]::integer[]) id(id) 
		LEFT OUTER JOIN matview_locations a ON a.id = id.id 
		WHERE a.active = true 
        ORDER BY a.id Desc, a.locations Asc
	) xx

$function$;

SELECT * FROM rtn_warehouses(Array[1,2,3,37]::integer[]) AS "warehouses";