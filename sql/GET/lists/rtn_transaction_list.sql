CREATE OR REPLACE FUNCTION public.rtn_transaction_list(_products integer[])
 RETURNS json
 LANGUAGE sql
AS $function$
				
	SELECT array_to_json(array_agg(row_to_json(t)))
	FROM(
		SELECT
			b.id,
			b.agent_number,
			b.manufacturer_id AS "manufacturer_id",
			a.name AS "product",
			COALESCE(a.sku::text, '---') AS "sku",
			COALESCE(a.batch_id::text, '---') AS "batch_number",
			COALESCE(a.batch_name::text, '---') AS "batch_name",
			COALESCE(a.upc, '---') AS "upc",
			COALESCE((a.litres_per_bottle::numeric(10,2))::text, '0.00') AS "litres_per_bottle",
			COALESCE(a.bottles_per_case::text, '---') AS "bottles_per_case",
			COALESCE((a.alcohol_percentage::numeric(10,2))::text, '0.00') AS "alcohol_percentage",
			COALESCE((a.litter_rate::numeric(10,4))::text, '0.00') AS "litter_rate",
			COALESCE((a.mfr_price::numeric(10,2))::text, '0.00') AS "manufacturer_price",
			COALESCE((a.rtl_price::numeric(10,2))::text, '0.00') AS "retail_price",
			COALESCE((a.ws_price::numeric(10,2))::text, '0.00') AS "wholesale_price"
			-- COALESCE((a.sp_price::numeric(10,2))::text, '0.00') AS "special_price"
		FROM UNNEST(ARRAY[_products]::integer[]) id(id)
		LEFT OUTER JOIN pim_batch a ON a.product_id = id.id 
		LEFT OUTER JOIN pim_products b ON b.id = a.product_id
		WHERE b.active = true
		ORDER BY id.id
	) t

$function$;

SELECT * FROM rtn_transaction_list(ARRAY[1,6,9]::integer[]);