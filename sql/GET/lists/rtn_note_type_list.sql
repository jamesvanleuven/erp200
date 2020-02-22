/*
CREATE OR REPLACE FUNCTION public.rtn_note_type_list(_id integer)
 RETURNS TABLE(note_type json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		
		RETURN QUERY (
			SELECT array_to_json(array_agg(row_to_json(t)))
			FROM(
				SELECT
					a.id AS "id",
                    a.module_id,
					a.name AS "value"
				FROM public.pim_note_types a 
				WHERE a.module_id = 0 OR a.module_id = _id 
				ORDER BY a.name
			) t
		);

	END;

$function$;
*/


CREATE OR REPLACE FUNCTION public.rtn_note_type_list(
	_id integer[]
)
 RETURNS TABLE (
 
 	note_type json
) LANGUAGE plpgsql
AS $function$
	
	BEGIN
		
		RETURN QUERY (
			SELECT array_to_json(array_agg(row_to_json(t)))
			FROM(
				SELECT 
					a.id
					, id.id AS module_id
					, LOWER(b.name) AS module
					, LOWER(a.name) AS value
					, a.admin
					, a.pdf
				FROM UNNEST(ARRAY[_id]::integer[]) id(id)
				LEFT OUTER JOIN pim_note_types a ON a.module_id = id.id 
				LEFT OUTER JOIN cms_modules b ON b.id = a.module_id
				ORDER BY id.id
			) t
		);

	END;

$function$;

SELECT * FROM rtn_note_type_list( ARRAY[0,4]::integer[] );