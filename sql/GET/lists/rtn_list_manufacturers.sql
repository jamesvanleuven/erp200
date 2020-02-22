CREATE OR REPLACE FUNCTION public.rtn_list_manufacturers(_manufacturers integer[])
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		IF _manufacturers = ARRAY[0]::integer[] OR _manufacturers = '{}' OR _manufacturers IS NULL
		THEN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT 
						a.id,
						a.manufacturers AS "value"
					FROM public.matview_manufacturers a 
					WHERE a.active = true
					ORDER BY a.manufacturers
				) t
			);
		ELSE
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT
						a.id,
						a.manufacturers AS "value"
					FROM public.matview_manufacturers a 
					WHERE 
						a.id = ANY((ARRAY[_manufacturers]::integer[])) 
						AND a.active = true
					ORDER BY a.manufacturers
				) t
			);
		END IF;
	END;

$function$;