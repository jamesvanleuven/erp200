CREATE OR REPLACE FUNCTION public.rtn_lineItems(
	_items integer[],
	_manufacturer integer,
	_location integer
)  RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(t))) 
	FROM (
		SELECT 
			b.product_id,
			b.id AS batch_id,
			a.sku,
			b.name AS product,
			b.litres_per_bottle,
			b.bottles_per_skid,
			b.bottles_per_case,
			b.litter_rate,
			b.mfr_price,
			b.rtl_price,
			b.ws_price,
			b.category_1 AS package_type,
			b.category_2 AS product_type,
			c.quantity
		FROM unnest(ARRAY[_items]::integer[]) id(id) 
		LEFT OUTER JOIN pim_products a ON a.id = id.id 
		LEFT OUTER JOIN pim_batch b ON b.product_id = a.id 
		LEFT OUTER JOIN pim_inventory c ON c.product_id = a.id AND c.batch_id = b.id 
		WHERE c.manufacturer_id = _manufacturer AND c.location_id = _location
		ORDER BY a.id
	) t;

$function$;

SELECT * FROM public.rtn_lineItems( ARRAY[1,2,3,4,5]::integer[], '362'::integer, '1'::integer );