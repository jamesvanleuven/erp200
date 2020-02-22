CREATE OR REPLACE FUNCTION public.rtn_transaction_items(_products integer[], _location integer)
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(t)) 
	FROM (
		SELECT
			id.id,
			(SELECT * FROM rtn_element_select(47::bigint, a.name::text, id.id::integer)) AS "product",
			(SELECT * FROM rtn_element_bigint(15::bigint, a.sku::bigint)) AS "sku",
			(SELECT * FROM rtn_element_float(17::bigint, a.litres_per_bottle::numeric(10,4))) AS "litres_per_bottle",
			(SELECT * FROM rtn_element_integer(23::bigint, a.bottles_per_case::integer)) AS "bottles_per_case",
			(SELECT * FROM rtn_element_money(20::bigint, a.litter_rate::numeric(10,2))) AS "litter_rate",
--			(SELECT * FROM rtn_element_float(24::bigint, a.mfr_price::numeric(10,2))) AS "manufacturer_price",
			(SELECT * FROM rtn_element_float(25::bigint, a.rtl_price::numeric(10,2))) AS "price",
--			(SELECT * FROM rtn_element_float(26::bigint, a.sp_price::numeric(10,2))) AS "special_price",
			(SELECT * FROM rtn_element_integer(21::bigint, b.quantity::integer)) AS "quantity"
		FROM UNNEST(ARRAY[_products]::integer[]) id(id)
		LEFT OUTER JOIN pim_batch a ON a.product_id = id.id
		LEFT OUTER JOIN pim_inventory b ON b.product_id = id.id 
		WHERE b.location_id = _location
	) t

$function$;

SELECT * FROM rtn_transaction_items(ARRAY[91,93,97]::integer[], 1::integer);