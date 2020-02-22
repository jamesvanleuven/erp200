CREATE OR REPLACE FUNCTION public.rtn_report_statuses(
	_modules integer[]
) RETURNS TABLE(
	result json
) LANGUAGE plpgsql
AS $function$

	BEGIN
		
		RETURN QUERY (
			SELECT array_to_json(array_agg(t)) 
			FROM (
				SELECT 
					a.module_id
					, b.name AS "value" 
				FROM UNNEST(_modules) id(id)
				LEFT OUTER JOIN pim_transactions a ON a.module_id = id.id 
				LEFT OUTER JOIN pim_statuses b ON a.id IN(SELECT(UNNEST(b.transaction_id)))
				LEFT OUTER JOIN cms_modules c ON c.id = id.id
				ORDER BY b.id
			) t
		);

	END;

$function$;

SELECT * FROM rtn_report_statuses( ARRAY[4,5]::integer[] );