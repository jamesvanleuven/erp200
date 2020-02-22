CREATE OR REPLACE FUNCTION public.rtn_product_selected(_id integer, _location integer)
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		
		RETURN QUERY (
			SELECT row_to_json(t)
			FROM(
				SELECT
					a.product_id AS "id",
					a.name AS "value"
				FROM public.pim_batch a 
				LEFT OUTER JOIN public.pim_inventory b ON b.batch_id = a.id
				WHERE 
					a.product_id = _id::integer 
					AND b.location_id = _location::integer
					AND a.active = true
				ORDER BY a.product_id, a.name
			) t
		);

	END;

$function$;

SELECT * FROM rtn_product_selected(42::integer, 1::integer);
