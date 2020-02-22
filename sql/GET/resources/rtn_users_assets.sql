CREATE OR REPLACE FUNCTION public.rtn_users_assets()
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "customers"
			FROM (
				SELECT 
					(SELECT rtn_establishment_types(0)) AS "establishment_types",
					(SELECT rtn_license_types(0)) AS "license_types",
					(SELECT rtn_license_sub_types(0)) AS "license_sub_types"
			) a3
	) a2;

$function$