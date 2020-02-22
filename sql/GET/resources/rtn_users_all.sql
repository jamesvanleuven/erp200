CREATE OR REPLACE FUNCTION public.rtn_users_all(_limit integer, _offset integer, _manufacturer_id integer, _location_id integer)
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) AS "results"
	FROM (
			SELECT row_to_json(a3) AS "customers"
			FROM (
				SELECT 
					(SELECT * FROM rtn_users(_limit, _offset, _manufacturer_id, _location_id)) AS "items",
					(SELECT * FROM rtn_users_assets()) AS "assets"
			) a3
	) a2;

$function$
