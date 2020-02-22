CREATE OR REPLACE FUNCTION public.rtn_transaction_lineItems(
    _manufacturer integer, 
    _location integer,
    _lineItems integer[]
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$

	BEGIN
		
		RETURN QUERY (
			SELECT array_to_json(array_agg(row_to_json(t)))
			FROM(
                SELECT
                    b.id,
                    b.agent_number,
                    b.manufacturer_id,
                    c.location_id,
                    a.name AS "product",
                    COALESCE(a.batch_id::text, '') AS "batch_number",
                    COALESCE(a.batch_name::text, '') AS "batch_name",
                    a.sku AS "sku",
                    a.upc AS "upc",
                    a.category_1 AS "product_type",

                    a.category_2 AS "package_type",
                    COALESCE((a.litres_per_bottle::numeric(10,2))::text, '0.00') AS "litres_per_bottle",
                    COALESCE(a.bottles_per_case::text, '---') AS "bottles_per_case",
                    COALESCE(a.bottles_per_skid::text, '---') AS "bottles_per_sku",
                    COALESCE((a.alcohol_percentage::numeric(10,2))::text, '0.00') AS "alcohol_percentage",
                    COALESCE((a.litter_rate::numeric(10,4))::text, '0.00') AS "litter_rate",
                    COALESCE((a.mfr_price::numeric(10,2))::text, '0.00') AS "manufacturer_price",
                    COALESCE((a.rtl_price::numeric(10,2))::text, '0.00') AS "retail_price",
                    COALESCE((a.ws_price::numeric(10,2))::text, '0.00') AS "wholesale_price",
                    COALESCE((c.quantity::integer)::text, '0') AS "inventory",
                    COALESCE((c.on_hold::integer)::text, '0') AS "on_hold",
                    (SELECT * FROM public.rtn_product_selected(b.id::integer, c.location_id::integer)) AS "selected"
                FROM UNNEST(ARRAY[_lineItems]::integer[]) id(id) 
                LEFT OUTER JOIN pim_batch a ON a.product_id = id.id
                LEFT OUTER JOIN pim_products b ON b.id = a.product_id
                LEFT OUTER JOIN pim_inventory c ON c.product_id = a.product_id 
                WHERE 
                    b.manufacturer_id = _manufacturer::integer 
                    AND 
                    c.location_id = _location::integer
                ORDER BY a.name
			) t
		);

	END;

$function$;

SELECT * FROM rtn_transaction_lineItems(442, 1, ARRAY[46, 74]::integer[] );