CREATE OR REPLACE FUNCTION public.rtn_users(
	_limit integer, 
	_offset integer, 
	_location_id integer
)
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(t))) 
	FROM (
		SELECT 
			a.id,
			a.location_id,
			(SELECT * FROM rtn_element_integer('1'::bigint,a.license_number::integer)) AS "license_number",
			(SELECT * FROM rtn_element_integer('7'::bigint,a.agent_number::integer)) AS "agent_number",
			(SELECT * FROM rtn_element_text('2'::bigint,a.customers::text)) AS "customers",
			(SELECT * FROM rtn_element_select('3'::bigint, a.establishment_types::text, a.establishment_type_id::bigint) ) AS "establishment_types",
			(SELECT * FROM rtn_element_select('4'::bigint, a.license_types::text, a.license_type_id::bigint) ) AS "license_types",
			(SELECT * FROM rtn_element_select('5'::bigint, a.license_sub_types::text, a.license_sub_type_id::bigint) ) AS "license_sub_types",
			(SELECT * FROM rtn_element_boolean('8'::bigint,a.active::boolean)) AS "is_active",
			(SELECT COUNT(*) FROM matview_customers) AS "totalRecords"
		FROM 
			matview_users a 
		WHERE a.state_id = '2' AND a.location_id::integer[] @> ARRAY[_location_id::integer] 
        ORDER BY a.customers, a.active
		OFFSET _offset 
		LIMIT _limit
	) t

$function$;