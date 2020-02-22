DROP FUNCTION IF EXISTS public.rtn_customers_assets();

CREATE OR REPLACE FUNCTION public.rtn_customers_assets()
 RETURNS json
 LANGUAGE sql
AS $function$
/*
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_establishment_types;
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_license_sub_types;
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_license_types;
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_cda_provinces;
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_bc_municipalities;
*/
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "customers"
			FROM (
				SELECT 
					(SELECT rtn_customer_types(0)) AS "customer_type",
					(SELECT rtn_license_types(0)) AS "license_type",
					(SELECT rtn_license_sub_types(0)) AS "license_sub_types",
					(SELECT * FROM rtn_note_type_list_new(ARRAY[0,10]::integer[])) AS "note_types",
					(SELECT * FROM rtn_matview_schema('establishments'::character varying, 'matview_customers'::character varying)) AS "elements",
					(SELECT * FROM rtn_provinces()) AS "provinces",
					(SELECT * FROM rtn_municipalities(2::bigint)) AS "cities"

			) a3
	) a2;

$function$;