DROP FUNCTION IF EXISTS public.rtn_profile(
	_usr character varying
	, _pwd character varying
);

CREATE OR REPLACE FUNCTION public.rtn_profile(
	_usr character varying
	, _pwd character varying
) RETURNS json LANGUAGE sql
AS $function$

	SELECT row_to_json(t1) AS profile
	FROM (
		SELECT 
			a.id AS login_id,
			b.id AS user_id, 
			b.establishment_id AS "establishment",
			replace(''||b.socket||'','-','') AS "channel", 
			(SELECT * FROM rtn_manufacturers_list(ARRAY[b.manufacturers]::integer[])) AS "manufacturers",
--			(SELECT * FROM rtn_list_locations(Array[b.locations]::integer[])) AS "locations",
			replace(''||b.key||'','-','') AS key,
			(
				SELECT row_to_json(t1)
				FROM (
					SELECT 
						aa.firstname AS "First",
						aa.lastname As "Last",
						textcat(textcat(aa.firstname, text ' '), aa.lastname) AS "FullName"
					FROM crm_users AS aa
					WHERE aa.id = a.usr_id
				) t1
			) AS "Name",
			(SELECT rtn_emails(_usr,_pwd)) AS emails,
			(SELECT rtn_phones(_usr,_pwd)) AS phones,
			(SELECT rtn_addresses(_usr,_pwd)) AS addresses

		FROM acl_login AS a 
		LEFT OUTER JOIN crm_users AS b ON b.id = a.usr_id 
--		LEFT OUTER JOIN crm_details AS c ON c.crm_id = b.id 
	
		WHERE (
			a.usr = _usr AND 
			a.pwd = _pwd AND 
			a.active = true
		)
	) t1

$function$;