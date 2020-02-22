CREATE OR REPLACE FUNCTION public.rtn_manufacturers_assets()
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "manufacturers"
			FROM (
				SELECT 
					(SELECT rtn_establishment_types(0)) AS "establishment_types",
					(SELECT rtn_license_types(0)) AS "license_types",
					(SELECT rtn_license_sub_types(0)) AS "license_sub_types",
					(SELECT * FROM rtn_transaction_schema('crm_establishments'::character varying)) AS "elements",
					(SELECT * FROM rtn_provinces()) AS "provinces",
					(SELECT * FROM rtn_municipalities(2::bigint)) AS "municipalities"
			) a3
	) a2;
$function$;

SELECT * FROM rtn_manufacturers_assets();