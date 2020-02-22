CREATE OR REPLACE FUNCTION public.rtn_inventory_lineitems(
	_products bigint[], 
	_manufacturer integer, 
	_location integer
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
					a.product_id,
					a.batch_id,
					a.quantity,
					a.on_hold
				FROM UNNEST(ARRAY[_products]::integer[]) id(id)
				LEFT OUTER JOIN public.pim_inventory a ON a.batch_id = id.id
				WHERE 
					a.manufacturer_id = _manufacturer::integer
					AND a.location_id = _location::integer 
			) t
		);

	END;

$function$;