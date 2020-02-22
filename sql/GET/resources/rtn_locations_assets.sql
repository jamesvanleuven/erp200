CREATE OR REPLACE FUNCTION public.rtn_locations_assets(_establishment_id integer)
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "locations"
			FROM (
				SELECT 
					(SELECT * FROM rtn_warehouses(Array[1,2,3,37]::integer[])) AS "locations",
					(SELECT * FROM rtn_establishment_types(0)) AS "establishment_types",
					(SELECT * FROM rtn_establishments(_establishment_id::bigint)) AS "establishments"
			) a3
	) a2;

$function$;

SELECT * FROM rtn_locations_assets('362');