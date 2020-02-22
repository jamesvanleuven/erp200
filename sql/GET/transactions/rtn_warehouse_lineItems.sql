CREATE OR REPLACE FUNCTION public.rtn_warehouse_lineitems(
	_products bigint[], 
	_manufacturer integer, 
	_locations integer[]
) RETURNS TABLE (
	result json
) LANGUAGE plpgsql
AS $function$

	BEGIN
		
		RETURN QUERY (
			SELECT array_to_json(array_agg(row_to_json(t)))
			FROM(
				SELECT
					a.id,
					a.location_id,
					a.product_id,
					a.batch_id,
					a.quantity,
					a.on_hold
				FROM UNNEST(ARRAY[_products]::integer[]) id(id)
				LEFT OUTER JOIN public.pim_inventory a ON a.product_id = id.id
				WHERE 
					a.manufacturer_id = _manufacturer::integer
					AND a.location_id IN (SELECT UNNEST(ARRAY[_locations]::integer[]))
				ORDER BY a.product_id, a.location_id
			) t
		);

	END;

$function$;

SELECT * FROM public.rtn_warehouse_lineitems( ARRAY[74, 51]::integer[], 442, ARRAY[1,2]::integer[] ) AS lineItems;
