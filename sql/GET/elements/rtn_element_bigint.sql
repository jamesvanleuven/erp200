DROP FUNCTION IF EXISTS public.rtn_element_bigint(
	_element_id bigint
	, _value bigint
); 

CREATE OR REPLACE FUNCTION public.rtn_element_bigint(
	_element_id bigint
	, _value bigint
) RETURNS json 
LANGUAGE sql
AS $function$

	SELECT row_to_json(t)
	FROM (
		SELECT row_to_json(tt) 
		FROM (
			SELECT
				b.column_name AS field,
				b.name AS name,
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
                _value AS "value"
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
		) tt
	) t

$function$;
