DROP FUNCTION IF EXISTS public.rtn_element_array(bigint, integer[]);
DROP FUNCTION IF EXISTS public.rtn_element_bigint(bigint, bigint);
DROP FUNCTION IF EXISTS public.rtn_element_boolean(bigint, boolean);
DROP FUNCTION IF EXISTS public.rtn_element_datetime(bigint, text);
DROP FUNCTION IF EXISTS public.rtn_element_float(bigint, numeric);
DROP FUNCTION IF EXISTS public.rtn_element_integer(bigint, integer);
DROP FUNCTION IF EXISTS public.rtn_element_json(bigint, json);
DROP FUNCTION IF EXISTS public.rtn_element_money(bigint, numeric);
DROP FUNCTION IF EXISTS public.rtn_element_select(bigint, text, bigint);
DROP FUNCTION IF EXISTS public.rtn_element_text(bigint, text);
DROP FUNCTION IF EXISTS public.rtn_element_textarray(bigint, text);
DROP FUNCTION IF EXISTS public.rtn_element_permissions(bigint);

-- ARRAY ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_array(_element_id bigint, _value integer[])
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, _value AS value
				, b.ordinal
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;

-- BIGINT ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_bigint(_element_id bigint, _value bigint)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
			SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, _value AS value
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;

-- BOOLEAN ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_boolean(_element_id bigint, _value boolean)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
			SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, _value AS value
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;


-- DATETIME ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_datetime(_element_id bigint, _value text)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
			SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, (CURRENT_DATE || ' ' || _value::text) AS value
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;

-- FLOAT ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_float(_element_id bigint, _value numeric)
 RETURNS json
 LANGUAGE sql
AS $function$ 

	SELECT row_to_json(t1) 
	FROM (
		SELECT row_to_json(tp) 
		FROM (
			SELECT 
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible 
				, (
					CASE WHEN _value = 0 THEN 
						'0.00'::text 
					ELSE 
						_value::numeric(10, 2)::text 
					END
				) AS value
				, b.ordinal 
			FROM cms_elements AS b 
			WHERE b.id = _element_id
		) tp
	) t1 

$function$;

-- INTEGER ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_integer(_element_id bigint, _value integer)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, COALESCE(_value, 0) AS value
				, b.ordinal
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;

-- JSON ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_json(_element_id bigint, _value json)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
			SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, _value AS value
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;

-- CURRENCY ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_money(_element_id bigint, _value numeric)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
			SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, (
					CASE WHEN _value = 0 THEN 
						'0.00'::text 
					ELSE 
						_value::numeric(10,2)::text
					END
				) AS value
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id
        ) tp
    ) t1
$function$;

-- SELECT ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_select(_element_id bigint, _value text, _id bigint)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(tt5) 
		FROM (
				SELECT row_to_json(tp2) 
				FROM (
					SELECT 
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, (
					SELECT row_to_json(x1) 
					FROM (
						SELECT
							COALESCE(_value, NULL) AS value
							, COALESCE(_id, 0) AS id
					) x1
				) AS selected
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
		) tp2
	) tt5

$function$;

-- TEXT ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_text(_element_id bigint, _value text)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
			SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, INITCAP(LOWER(_value)) AS value
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
        ) tp
    ) t1
$function$;

-- TEXT ARRAY
CREATE OR REPLACE FUNCTION public.rtn_element_textarray(_element_id bigint, _value text)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
			SELECT
				b.column_name AS field
				, b.name AS filter
				, b.table_name AS table
				, b.alias AS alias
				, b.matview AS view_name
				, (
					SELECT row_to_json(p) FROM (
						SELECT
							b._post
							, b._put
							, b._patch
					) p
				) AS permissions
				, b.input
				, b.data_type
				, b.required
				, b.public_table AS visible
				, _value AS value
				, b.ordinal
			FROM cms_elements AS b 
			WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;

-- PERMISSIONS << DEPRECATED
/*
CREATE OR REPLACE FUNCTION public.rtn_element_permissions(_permission_id bigint)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)  
    FROM (
        SELECT 
            c._post,
            c._put, 
            c._patch
        FROM cms_elements c
        WHERE c.id = _permission_id 
    ) t1

$function$;
*/