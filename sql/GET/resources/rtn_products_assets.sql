CREATE OR REPLACE FUNCTION public.rtn_products_assets(_manufacturers integer[])
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "products"
			FROM (
				SELECT 
					(SELECT * FROM rtn_manufacturer_types(_manufacturers::integer[])) AS "manufacturer",
					(SELECT * FROM rtn_package_types()) AS "package_type",
					(SELECT * FROM rtn_product_types()) AS "product_type",
					(SELECT * FROM rtn_note_type_list_new(ARRAY[0,3]::integer[])) AS "note_types",
					(SELECT * FROM public.rtn_module_schema('pim_batch'::character varying, 'products'::character varying)) AS "elements"

			) a3
	) a2;
$function$;


SELECT * FROM rtn_products_assets(Array['362','16','67']::integer[]);