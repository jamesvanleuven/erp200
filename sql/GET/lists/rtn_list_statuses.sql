/**
 *  SELECT * FROM pim_transactions LIMIT 100;
 *
 *  SELECT 
 *  	a.id AS "transaction_id",
 *  	a.name AS "transaction",
 *  	a.module_id AS "module_id",
 *  	c.name AS "module",
 *  	b.name AS "status"
 *  	FROM pim_transactions a
 *  	LEFT OUTER JOIN pim_statuses b ON a.id = ANY(ARRAY[b.transaction_id]::integer[])
 *  	LEFT OUTER JOIN cms_modules c ON c.id = a.module_id
 *  	WHERE a.module_id = '4'; -- 4 = id IN cms_modules
*/

DROP FUNCTION public.rtn_list_statuses(_module integer);
CREATE OR REPLACE FUNCTION public.rtn_list_statuses(_module integer)
RETURNS TABLE(result json) LANGUAGE plpgsql
AS $function$

	BEGIN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT 
--						a.id AS "transaction_id",
--						a.name AS "transaction",
--						a.module_id AS "module_id",
--						c.name AS "module",
						b.id,
						b.name AS "value"
					FROM pim_transactions a
					LEFT OUTER JOIN pim_statuses b ON a.id = ANY(ARRAY[b.transaction_id]::integer[])
					LEFT OUTER JOIN cms_modules c ON c.id = a.module_id
					WHERE a.module_id = _module::integer
				) t
			);
	END;

$function$;

SELECT * FROM rtn_list_statuses( 4::integer ); -- order statuses