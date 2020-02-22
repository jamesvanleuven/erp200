CREATE OR REPLACE FUNCTION public.rtn_establishment_types(_int bigint)
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
					SELECT a.id, a.value, a.abbr 
					FROM UNNEST(ARRAY[1,2,3,37]::integer[]) id(id)
					LEFT OUTER JOIN matview_establishment_types a ON a.id = id.id
					ORDER BY a.value
				) t1
			);
	ELSE
		RETURN QUERY
			(
				SELECT row_to_json(t1)
				FROM (
					SELECT a.id, a.value, a.abbr FROM matview_establishment_types a 
					WHERE a.id IN(_int) 
					ORDER BY a.value
				) t1
			);
	END IF;
END;

$function$;