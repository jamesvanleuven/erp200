CREATE OR REPLACE FUNCTION public.rtn_login(_usr character varying, _pwd character varying)
 RETURNS json
 LANGUAGE sql
AS $function$
SELECT row_to_json(t2)
FROM (
	SELECT 
		(SELECT rtn_credentials(_usr, _pwd)) AS "credentials",
		(SELECT rtn_profile(_usr,_pwd)) AS "profile",
		(SELECT rtn_permissions(Array[b.location]::integer[])) AS "permissions",
		(
			SELECT row_to_json(t2)
			FROM (
				SELECT 
					(select * from rtn_system_modules(2)) AS "Application",
					(select * from rtn_system_modules(3)) AS "Users"
			) t2
		) AS "system",
		(select * from rtn_table_schema('acl_login')) AS "schema"
	FROM acl_login AS a 
	LEFT OUTER JOIN acl_credentials AS b ON b.user_id = a.usr_id 
	LEFT OUTER JOIN acl_groups AS c ON c.id = b.group_id 
	LEFT OUTER JOIN acl_roles AS d ON d.id = b.role_id 
	WHERE (
		a.usr = _usr AND a.pwd = _pwd AND a.active = true
	)
) t2
$function$;