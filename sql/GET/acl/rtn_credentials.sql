DROP FUNCTION IF EXISTS public.rtn_credentials(
	_usr character varying
	, _pwd character varying
);

CREATE OR REPLACE FUNCTION public.rtn_credentials(
	_usr character varying
	, _pwd character varying
) RETURNS json
 LANGUAGE sql
AS $function$
SELECT row_to_json(t2)
FROM (
	SELECT 
		b.group_id,
		c.name AS "group",
		b.role_id,
		d.name AS "role"
	FROM acl_login AS a 
	LEFT OUTER JOIN acl_credentials AS b ON b.user_id = a.usr_id 
	LEFT OUTER JOIN acl_groups AS c ON c.id = b.group_id 
	LEFT OUTER JOIN acl_roles AS d ON d.id = b.role_id 
	WHERE (a.usr = _usr AND a.pwd = _pwd AND a.active = true)
) t2;

$function$;
