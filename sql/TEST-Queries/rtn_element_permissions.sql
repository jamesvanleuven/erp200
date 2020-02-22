/**
 *  TURN THIS INTO A FUNCTION SO I CAN STRIP OUT ALL THE SILLINESS
 *  FROM THE MODULE ELEMENTS LISTED IN THE MATERIAL VIEWS WITH A 
 *  SIMPLE ARRAY LOOP FROM THE DATABASE
 *
 *  NOT ONLY WILL THIS BE LESS CODE BUT IT WILL ALSO SPEED UP THE
 *  APPLICATION YET AGAIN EXPONENTIALLY ALTHOUGH IT'S ALREADY AT
 *  A PRETTY DECENT SPEED RIGHT NOW
 *  
 *  BESIDES I WANT TO BE ABLE TO GENERATE NEW "ELEMENTS" ON THE FLY
 *  WITHOUT HAVING TO WRITE EXTRA FUNCTIONS IN THE DATABASE, WHEN
 *  IT'S JUST AS EASY TO REFERENCE ANOTHER FUNCTION
 *
 *  SO...
 *  CREATE OR REPLACE FUNCTION public.rtn_element_permissions(_array integer[], _value text)
 */

CREATE OR REPLACE FUNCTION public.rtn_element_permissions(_element_id integer, _value text)
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
                (
                    SELECT row_to_json(t1)  
                    FROM (
                        SELECT 
                            c._get, 
                            c._patch 
                        FROM acl_permissions c
                        WHERE c.id = b.permission_id 
                    ) t1
                ) AS "permissions",
                b.input,
                b.required
                _value AS "value"
            FROM cms_elements AS b 
            WHERE b.id = _element_id 
        ) tp
    ) t1

$function$;