CREATE OR REPLACE FUNCTION public.rtn_list_product_types()
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT 
						a.id,
						a.name AS "value"
					FROM pim_product_types a
				) t
			);
	END;

$function$;