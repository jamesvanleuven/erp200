CREATE OR REPLACE FUNCTION public.rtn_system_modules(_int integer)
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(t)
	FROM (
			SELECT array_to_json(array_agg(t1)) AS Modules
			FROM (
				SELECT 
					a.id AS module_id,
					a.name AS module,
					a.ico,
					(
						SELECT row_to_json(t2) AS permissions
						FROM (
							SELECT
								aa._get,
								aa._post,
								aa._put,
								aa._patch,
								aa._delete,
								aa._print 
							FROM public.acl_permissions aa 
							WHERE aa.id = a.permission_id
						) t2
					) AS permissions 
				FROM public.cms_modules a 
				WHERE a.type_id = _int
			) t1
	) t;
$function$;