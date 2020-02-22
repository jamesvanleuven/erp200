-- ELEMENT PERMISSIONS
CREATE OR REPLACE FUNCTION public.rtn_element_permissions(_permission_id bigint)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)  
    FROM (
        SELECT 
            c._get, 
            c._patch 
        FROM acl_permissions c
        WHERE c.id = _permission_id 
    ) t1

$function$;

-- TEXT, VARYING CHARACTER ELEMENTS
CREATE OR REPLACE FUNCTION public.rtn_element_text(_element_id bigint, _value text)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
                b.column_name AS "field",
                b.table_name AS "table",
                (SELECT * FROM rtn_element_permissions(b.permission_id::bigint)) AS "permissions",
                b.input,
			   b.data_type,
                b.required,
                _value AS "value"
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1
$function$;

-- BOOLEAN, TRUE/FALSE, YES/NO, ON/OFF ELEMENTS
CREATE OR REPLACE FUNCTION public.rtn_element_boolean(_element_id bigint, _value boolean)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
                b.column_name AS "field",
                b.table_name AS "table",
                (SELECT * FROM rtn_element_permissions(b.permission_id::bigint)) AS "permissions",
                b.input,
			   b.data_type,
                b.required,
                _value AS "value"
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1
$function$;

-- INTEGER ELEMENTS
CREATE OR REPLACE FUNCTION public.rtn_element_integer(_element_id bigint, _value integer)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
                b.column_name AS "field",
                b.table_name AS "table",
                (SELECT * FROM rtn_element_permissions(b.permission_id::bigint)) AS "permissions",
                b.input, 
                b.data_type,
                b.required,
                _value AS "value"
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1
$function$;

-- FLOAT ELEMENTS
CREATE OR REPLACE FUNCTION public.rtn_element_float(_element_id bigint, _value numeric)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
                b.column_name AS "field",
                b.table_name AS "table",
                (SELECT * FROM rtn_element_permissions(b.permission_id::bigint)) AS "permissions",
                b.input,
			   b.data_type,
                b.required,
                _value AS "value"
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1
$function$;


-- MONEY ELEMENTS
CREATE OR REPLACE FUNCTION public.rtn_element_money(_element_id bigint, _value numeric)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
                b.column_name AS "field",
                b.table_name AS "table",
                (SELECT * FROM rtn_element_permissions(b.permission_id::bigint)) AS "permissions",
                b.input, 
                b.data_type,
                b.required,
                _value AS "value"
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1
$function$;

-- SELECT LISTS
CREATE OR REPLACE FUNCTION public.rtn_element_select(_element_id bigint, _value text, _id bigint)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(tt5) FROM (
        (
            SELECT row_to_json(tp2) FROM (
                SELECT
                    b.column_name AS "field",
                    b.table_name AS "table",
                    (SELECT * FROM rtn_element_permissions(b.permission_id::bigint)) AS "permissions",
                    b.input,
				   b.data_type,
                    b.required,
                    (
                        SELECT row_to_json(x1) FROM (
                            SELECT
                            _value AS "value",
                            _id AS "id"
                        ) x1

                    ) AS "selected"
                FROM cms_elements AS b 
                WHERE b.id = _element_id 
            ) tp2
        )
    ) tt5
$function$;

-- BIG INTEGER ELEMENT
CREATE OR REPLACE FUNCTION public.rtn_element_bigint(_element_id bigint, _value bigint)
 RETURNS json
 LANGUAGE sql
AS $function$

    SELECT row_to_json(t1)
    FROM (
        SELECT row_to_json(tp) 
        FROM (
            SELECT
                b.column_name AS "field",
                b.table_name AS "table",
                (SELECT * FROM rtn_element_permissions(b.permission_id::bigint)) AS "permissions",
                b.input,
			   b.data_type,
                b.required,
                _value AS "value"
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;