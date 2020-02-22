DROP FUNCTION IF EXISTS public.rtn_customer_types(
	_int bigint
);

CREATE OR REPLACE FUNCTION public.rtn_customer_types(
	_int bigint
) RETURNS TABLE (
	result json
) LANGUAGE plpgsql
AS $function$

BEGIN

    IF _int IS NULL OR _int = 0 THEN
		RETURN QUERY
			(
				SELECT array_to_json(array_agg(t))
				FROM (
					SELECT 
						a.id
						, a.name AS value
						, a.abbr 
					FROM crm_customer_types a  
					ORDER BY a.id
				) t
			);
	ELSE
		RETURN QUERY
			(
				SELECT row_to_json(t)
				FROM (
					SELECT 
						a.id
						, a.name AS value
						, a.abbr 
					FROM crm_customer_types a 
					WHERE a.id = _int 
				) t
			);
	END IF;
	
END;

$function$;
