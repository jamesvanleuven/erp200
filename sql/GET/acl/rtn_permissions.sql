CREATE OR REPLACE FUNCTION public.rtn_permissions(_arr integer[])
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
					b.id AS location_id, 
					b.name AS "location",
					c.delivery_days,
					b.establishment_id
				FROM crm_locations b 
				LEFT OUTER JOIN public.crm_establishments c ON c.id = b.establishment_id
				WHERE b.id = a.location_id 
			) t1
		) AS "location",
		(
			SELECT array_to_json(array_agg(row_to_json(t2))) 
			FROM (
				SELECT 
					c.id AS "module_id",
					c.name AS "module",
					c.module_type_id AS "type",
					c.ico,
					c.permission_id,
					(
						SELECT row_to_json(t3) 
						FROM (
							SELECT 
								(
									SELECT row_to_json(t4)
									FROM (
										SELECT 
											e.*
										FROM acl_permissions e 
										WHERE e.id = d.permission_id 
									) t4
								) AS items
							FROM 
							acl_module_permissions d 
							WHERE d.assignment_id = c.id 
						) t3
					) AS "permissions"
				FROM unnest(ARRAY[a.modules]::integer[]) id1(id) 
				LEFT OUTER JOIN cms_modules c ON c.id = id1.id
			) t2 
		) AS "modules"
		FROM acl_location_modules a
		WHERE usr_id = _usr_id
	) t

$function$;