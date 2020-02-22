CREATE OR REPLACE FUNCTION public.rtn_list_products(
    _manufacturers integer[], 
    _location integer
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$

	BEGIN
		
		RETURN QUERY (
			SELECT array_to_json(array_agg(row_to_json(t)))
			FROM(
				SELECT
					a.product_id AS "id",
					a.name AS "value",
					a.name AS "product",
					b.manufacturer_id,
					a.sku,
					a.upc,
					a.litres_per_bottle,
					a.bottles_per_skid,
					a.bottles_per_case,
					a.litter_rate,
					a.mfr_price,
					a.rtl_price,
					a.ws_price,
					a.category_1 AS "product_type",
					a.category_2 AS "package_type"				FROM public.pim_batch a 
				LEFT OUTER JOIN public.pim_inventory b ON b.batch_id = a.id
				WHERE 
					b.manufacturer_id = ANY((ARRAY[_manufacturers]::integer[])) 
					AND b.location_id = _location::integer
					AND a.active = true
				ORDER BY a.product_id, a.name
			) t
		);

	END;

$function$;