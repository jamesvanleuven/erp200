CREATE OR REPLACE FUNCTION public.rtn_locations(
    _limit integer, 
    _offset integer, 
    _locations integer[]
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$ 

	BEGIN
    
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_locations;
    
		IF _locations IS NULL OR _locations = '{}' THEN 
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t))) 
				FROM (
					SELECT 
						a.id,
						(SELECT * FROM rtn_element_select('28'::bigint,a.name::text,a.id::bigint)) AS "locations",
						(SELECT * FROM rtn_element_select('30'::bigint,c.name::text,a.establishment_type_id::bigint)) AS "establishment_types",
						(SELECT * FROM rtn_element_select('29'::bigint,b.name::text,a.establishment_id::bigint)) AS "establishments",
						(SELECT * FROM rtn_element_text(66::bigint, a.street::text)) AS "address",
						(SELECT row_to_json(t) FROM (SELECT * FROM matview_addresses WHERE id = a.address_id) t) AS "full_address",
						(SELECT * FROM rtn_element_datetime(67::bigint, a.opens::text)) AS "opens_at",
						(SELECT * FROM rtn_element_datetime(68::bigint, a.closes::text)) AS "closes_at",
						(SELECT * FROM rtn_element_json(69::bigint, a.delivery_days::json)) AS "delivery_days"
					FROM  matview_locations a  
					LEFT OUTER JOIN crm_establishments b ON b.id = a.establishment_id 
					LEFT OUTER JOIN crm_establishment_types c ON c.id = a.establishment_type_id 
					WHERE (
						a.state_id = '2' 
						AND a.active = True
					)
					ORDER BY b.id
					OFFSET _offset 
					LIMIT _limit
				) t
			);
		ELSE
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t))) 
				FROM (
					SELECT 
						a.id,
						(SELECT * FROM rtn_element_select('28'::bigint,a.name::text,a.id::bigint)) AS "locations",
						(SELECT * FROM rtn_element_select('30'::bigint,c.name::text,a.establishment_type_id::bigint)) AS "establishment_types",
						(SELECT * FROM rtn_element_select('29'::bigint,b.name::text,a.establishment_id::bigint)) AS "establishments",
						(SELECT * FROM rtn_element_text(66::bigint, a.street::text)) AS "address",
						(SELECT row_to_json(t) FROM (SELECT * FROM matview_addresses WHERE id = a.address_id) t) AS "full_address",
						(SELECT * FROM rtn_element_datetime(67::bigint, a.opens::text)) AS "opens_at",
						(SELECT * FROM rtn_element_datetime(68::bigint, a.closes::text)) AS "closes_at",
						(SELECT * FROM rtn_element_json(69::bigint, a.delivery_days::json)) AS "delivery_days"
					FROM UNNEST(ARRAY[_locations]::integer[]) id(id)
					LEFT OUTER JOIN matview_locations a ON a.id = id.id 
					LEFT OUTER JOIN crm_establishments b ON b.id = a.establishment_id 
					LEFT OUTER JOIN crm_establishment_types c ON c.id = a.establishment_type_id 
					WHERE (
						a.state_id = '2' 
						AND a.active = True
					)
					ORDER BY id.id
					OFFSET _offset 
					LIMIT _limit
				) t
			);
		END IF;
	END;

$function$;


SELECT * FROM public.rtn_locations(25, 0, ARRAY[]::integer[]);
SELECT * FROM public.rtn_locations(25, 0, ARRAY[1,2,3]::integer[]);