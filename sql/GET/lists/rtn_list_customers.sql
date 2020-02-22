CREATE OR REPLACE FUNCTION public.rtn_list_customers(_customers integer[])
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		IF _customers = ARRAY[0]::integer[] OR _customers = '{}' OR _customers IS NULL
		THEN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT 
						a.id,
						a.customers AS "value",
						a.customer_abbr,
						a.license_abbr
					FROM public.matview_customers a 
					WHERE a.active = true
					ORDER BY a.id
				) t
			);
		ELSE
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT
						a.id,
						a.customers AS "value",
						a.customer_abbr,
						a.license_abbr
					FROM public.matview_customers a 
					WHERE 
						a.id = ANY((ARRAY[_customers]::integer[])) 
						AND a.active = true
					ORDER BY a.id
				) t
			);
		END IF;
	END;

$function$;

SELECT * FROM rtn_list_customers(ARRAY[]::integer[]);