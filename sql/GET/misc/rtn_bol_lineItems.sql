DROP FUNCTION IF EXISTS public.rtn_bol_lineitems(
	_products integer[]
	, _manufacturer integer
	, _location integer
);

CREATE OR REPLACE FUNCTION public.rtn_bol_lineitems(
	_products integer[]
	, _manufacturer integer
	, _location integer
) RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(t)))
	FROM(
		SELECT DISTINCT
			a.product_id,
			b.agent_number,
			b.manufacturer_id,
			INITCAP(LOWER(a.name)) AS "product",
			COALESCE(a.batch_id::text, '') AS "batch_number",
			COALESCE(a.batch_name::text, '') AS "batch_name",
			a.sku AS "sku",
			a.upc AS "upc",
			a.category_1 AS "product_type",
			a.category_2 AS "package_type",
			COALESCE((a.litres_per_bottle::numeric(10,2))::text, '0.00')::numeric(10,2) AS "litres_per_bottle",
			COALESCE(a.bottles_per_case::text, '0')::integer AS "bottles_per_case",
			COALESCE((a.alcohol_percentage::numeric(10,2))::text, '0.00')::numeric(10,2) AS "alcohol_percentage",
			COALESCE((a.litter_rate::numeric(10,4))::text, '0.00')::numeric(10,2) AS "litter_rate",
			COALESCE((a.mfr_price::numeric(10,2))::text, '0.00')::numeric(10,2) AS "manufacturer_price",
			COALESCE((a.rtl_price::numeric(10,2))::text, '0.00')::numeric(10,2) AS "retail_price",
			COALESCE((a.ws_price::numeric(10,2))::text, '0.00')::numeric(10,2) AS "wholesale_price"
		FROM UNNEST(ARRAY[_products]::bigint[]) id(id)
		-- THIS NEEDS TO BE ADJUSTED TO CALL FROM THE MATVIEW_PRODUCTS
		-- TO ABORT THE NEED TO JOIN ON BATCH & INVENTORY
		LEFT OUTER JOIN pim_batch a ON a.product_id = id .id
		LEFT OUTER JOIN pim_products b ON b.id = a.product_id 
		LEFT OUTER JOIN pim_inventory c ON c.product_id = a.product_id
		WHERE b.manufacturer_id = _manufacturer AND c.location_id = _location
	) t

$function$;
