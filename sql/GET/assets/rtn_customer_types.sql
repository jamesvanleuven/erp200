CREATE OR REPLACE FUNCTION public.rtn_customer_types(_int bigint)
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

BEGIN

    IF _int IS NULL OR _int = '0'
	THEN
		RETURN QUERY
			(
				SELECT array_to_json(array_agg(t1))
				FROM (
					SELECT a.id, a.name AS value, a.abbr FROM crm_customer_types a  
					ORDER BY a.id
				) t1
			);
	ELSE
		RETURN QUERY
			(
				SELECT row_to_json(t1)
				FROM (
					SELECT a.id, a.name AS value, a.abbr FROM crm_customer_types a 
					WHERE a.id = _int 
				) t1
			);
	END IF;
END;

$function$;