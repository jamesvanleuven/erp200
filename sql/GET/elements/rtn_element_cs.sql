DROP FUNCTION IF EXISTS public.rtn_element_cs(bigint, text, bigint);

CREATE OR REPLACE FUNCTION public.rtn_element_cs(_element_id bigint, _value text, _id bigint)
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT row_to_json(t)
	FROM (
		SELECT row_to_json(tt) 
		FROM (
			SELECT
				b.column_name AS field,
				b.alias AS alias,
				b.table_name AS table,
				b.view_name AS view,
				(
					SELECT row_to_json(p) FROM (
						SELECT 
							b._get
							, b._put
							, b._post
							, b._patch
					) p
				) AS permissions,
				b.input,
				b.data_type,
				b.required,
				b.public_table AS visible,
				(
				SELECT row_to_json(x1) 
				FROM (
					SELECT
						_value AS value,
						_id AS id
					) x1
				) AS selected
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
		) tt
	) t

$function$;
