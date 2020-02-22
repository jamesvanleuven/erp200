DROP FUNCTION IF EXISTS public.bi_assets();

CREATE OR REPLACE FUNCTION public.bi_assets()
 RETURNS json
 LANGUAGE sql
AS $function$
	
SELECT row_to_json(t) 
FROM (
    SELECT 
		(SELECT * FROM rtn_product_types()) AS product_type
		, (SELECT * FROM rtn_package_types()) AS package_type
		, (SELECT * FROM bi_types()) AS bi_types
		, (SELECT * FROM bi_statuses( ARRAY[5])) AS status
		, (SELECT * FROM rtn_list_transfer_types(5)) AS transfer_type
) t;

$function$;