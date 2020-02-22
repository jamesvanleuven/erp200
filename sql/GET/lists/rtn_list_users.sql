CREATE OR REPLACE FUNCTION public.rtn_list_users(_manufacturer integer[])
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		IF _manufacturer = ARRAY[0]::integer[] OR _manufacturer = '{}' OR _manufacturer IS NULL
		THEN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT
						a.id,
						CONCAT( INITCAP(LOWER(a.firstname)), ' ', INITCAP(LOWER(a.lastname)) ) AS "value"
					FROM public.crm_users a 
					LEFT OUTER JOIN matview_manufacturers b ON b.id = a.establishment_id
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
						CONCAT( INITCAP(LOWER(a.firstname)), ' ', INITCAP(LOWER(a.lastname)) ) AS "value"
					FROM crm_users a 
					LEFT OUTER JOIN matview_manufacturers b ON b.id = a.establishment_id
					WHERE 
						a.establishment_id::text IN(SELECT(UNNEST(ARRAY[_manufacturer]::text[]))) 
						AND a.active = true
					ORDER BY a.id
				) t
			);
		END IF;
	END;

$function$;


SELECT * FROM rtn_list_users(ARRAY[362]::integer[]);
