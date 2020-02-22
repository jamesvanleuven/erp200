CREATE OR REPLACE FUNCTION public.rtn_products_list(_manufacturers integer, _location integer)
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(t)))
	FROM(
		SELECT
			b.id,
			b.agent_number::integer,
			b.manufacturer_id,
			c.location_id,
			a.name AS "product",
			COALESCE(a.batch_id::text, '') AS "batch_number",
			COALESCE(a.batch_name::text, '') AS "batch_name",
			a.sku::integer AS "sku",
			a.upc AS "upc",
			a.category_1 AS "product_type",
			a.category_2 AS "package_type",
			COALESCE(a.litres_per_bottle::numeric(10,2), (0.00)::numeric(10,2)) AS "litres_per_bottle",
			COALESCE(a.bottles_per_case::integer, (0)::integer) AS "bottles_per_case",
			COALESCE(a.bottles_per_skid::integer, (0)::integer) AS "bottles_per_sku",
			COALESCE(a.alcohol_percentage::numeric(10,2), (0.00)::numeric(10,4)) AS "alcohol_percentage",
			COALESCE(a.litter_rate::numeric(10,4), (0.00)::numeric(10,4)) AS "litter_rate",
			COALESCE(a.mfr_price::numeric(10,2), (0.00)::numeric(10,2)) AS "manufacturer_price",
			COALESCE(a.rtl_price::numeric(10,2), (0.00)::numeric(10,2)) AS "retail_price",
			COALESCE(a.ws_price::numeric(10,2), (0.00)::numeric(10,2)) AS "wholesale_price",
			COALESCE(c.quantity::integer, (0)::integer) AS "inventory",
			(SELECT * FROM public.rtn_product_selected(b.id::integer, c.location_id::integer)) AS "selected"
		FROM pim_batch a
		LEFT OUTER JOIN pim_products b ON b.id = a.product_id
		LEFT OUTER JOIN pim_inventory c ON c.product_id = a.product_id 
		WHERE 
			b.manufacturer_id = _manufacturers
			AND 
			c.location_id = _location::integer
		ORDER BY a.name
	) t
	

$function$;

SELECT * FROM rtn_products_list(377::integer, 1::integer);
