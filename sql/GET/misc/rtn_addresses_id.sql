CREATE OR REPLACE FUNCTION public.rtn_addresses_id(_street character varying, _city_id integer)
 RETURNS TABLE(id integer)
 LANGUAGE sql
AS $function$

    WITH x AS (
        SELECT 
            _street::character varying(500) AS street, 
            _city_id::integer AS city_id
    ), 
    y AS (
        SELECT x.street, x.city_id
            , (
                SELECT t.id 
                FROM sys_addresses t 
                WHERE 
                    t.street = x.street 
                    AND t.city_id = x.city_id
            ) AS id
        FROM x    
    ),
    z AS (
        INSERT INTO sys_addresses(street, city_id)
        SELECT y.street, y.city_id 
        FROM   y
        WHERE  y.id IS NULL
        RETURNING id
    )

    SELECT COALESCE(
        (SELECT id FROM z),
        (SELECT id FROM y)
    ) AS id;

$function$
