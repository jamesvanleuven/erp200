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