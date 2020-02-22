CREATE OR REPLACE FUNCTION public.rtn_emails(_usr character varying, _pwd character varying)
 RETURNS json
 LANGUAGE sql
AS $function$
SELECT 
	(
		SELECT row_to_json(t1)
		FROM (
				SELECT 
					(
						SELECT array_to_json(array_agg(t2))
						FROM (
							SELECT 
								aa.id,
								bb.type,
								aa.email AS item
							FROM unnest(Array[c.emails]::integer[]) id (id) 
							LEFT OUTER JOIN sys_emails AS aa ON aa."id" = id."id" 
							LEFT OUTER JOIN sys_type AS bb ON bb.id = aa.type_id 
							ORDER BY id.id desc
						) t2
					) AS Items
				FROM crm_users AS b 
					LEFT OUTER JOIN crm_details AS c 
					ON c.crm_id = b.id 
				WHERE (
					b.id = a.usr_id
				)
		) t1
	) 
FROM acl_login AS a 
WHERE (
	a.usr = _usr AND 
	a.pwd = _pwd
);
$function$;