DROP FUNCTION IF EXISTS public.bi_types();

CREATE OR REPLACE FUNCTION public.bi_types()
 RETURNS json
 LANGUAGE sql
AS $function$

SELECT array_to_json(array_agg(row_to_json(t)))
FROM (
	SELECT 
		a.id
		, a.alias AS value 
	FROM public.bi_types a
	ORDER BY a.id
) t
$function$;

SELECT * FROM bi_types();
