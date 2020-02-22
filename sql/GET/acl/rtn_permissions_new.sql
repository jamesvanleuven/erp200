CREATE OR REPLACE FUNCTION public.rtn_permissions_new(_locations integer[], _usr_id integer)
 RETURNS json
 LANGUAGE sql
AS $function$

SELECT array_to_json(array_agg(row_to_json(t)))
FROM (
	SELECT 
		(
		SELECT row_to_json(t1)
		FROM (
				SELECT 
					id.id AS "location_id"
					, b.name AS "location"
					, b.delivery_days
					, b.establishment_id
		) t1
		) AS "location",
		(
		SELECT array_to_json(array_agg(row_to_json(t1)))
		FROM (
			SELECT 
				c.id AS "module_id",
				c.name AS "module",
				c.module_type_id AS "type",
				c.ico,
				c.permission_id,
				(
					SELECT row_to_json(t4)
					FROM (
						SELECT 
							e.*
						FROM acl_permissions e 
						WHERE e.id = c.permission_id 
					) t4
				) AS permissions
			FROM unnest(ARRAY[a.modules]::integer[]) WITH ORDINALITY aa(id) 
			LEFT OUTER JOIN cms_modules c ON c.id = aa.id
			) t1
		) AS "modules"
	FROM UNNEST(ARRAY[_locations]::integer[]) WITH ORDINALITY id(id) 
	LEFT OUTER JOIN acl_location_modules a ON a.location_id = id.id 
	LEFT OUTER JOIN matview_locations b ON b.id = id.id
	WHERE usr_id = _usr_id 
) t

$function$;