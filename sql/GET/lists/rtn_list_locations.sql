CREATE OR REPLACE FUNCTION public.rtn_list_locations(_locations integer[])
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		IF _locations = ARRAY[0]::integer[] OR _locations = '{}' OR _locations IS NULL
		THEN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT 
						a.id,
						a.establishment_id,
						b.delivery_days,
						(
							SELECT row_to_json(t) FROM (
								SELECT
									(
										SELECT row_to_json(s) FROM (
											SELECT 
												a.address_id AS "id"
												, a.street AS "value"
										) s
									) AS "street"
									, (
										SELECT row_to_json(c) FROM (
											SELECT
												a.city_id AS "id"
												, a.township AS "value"
										) c
									) AS "city"
									, (
										SELECT row_to_json(c) FROM (
											SELECT
												a.state_id AS "id"
												, a.province AS "value"
										) c
									) AS "state"
									, a.zipcode
							) t
						) AS address, 
						a.name AS "value"
					FROM public.matview_locations a 
					LEFT OUTER JOIN public.matview_manufacturers b ON b.id = a.establishment_id
					WHERE a.active = true
					ORDER BY a.id
				) t
			);
		ELSE
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT 
						id.id,
						a.establishment_id,
						b.delivery_days,
						(
							SELECT row_to_json(t) FROM (
								SELECT
									(
										SELECT row_to_json(s) FROM (
											SELECT 
												a.address_id AS "id"
												, a.street AS "value"
										) s
									) AS "street"
									, (
										SELECT row_to_json(c) FROM (
											SELECT
												a.city_id AS "id"
												, a.township AS "value"
										) c
									) AS "city"
									, (
										SELECT row_to_json(c) FROM (
											SELECT
												a.state_id AS "id"
												, a.province AS "value"
										) c
									) AS "state"
									, a.zipcode
							) t
						) AS address, 
						a.name AS "value"
					FROM UNNEST(ARRAY[_locations]::integer[]) id(id)
					LEFT OUTER JOIN public.matview_locations a on a.id = id.id
					LEFT OUTER JOIN public.matview_manufacturers b ON b.id = a.establishment_id
					WHERE 
						a.active = true
					ORDER BY id.id
				) t
			);
		END IF;
	END;

$function$

SELECT * FROM rtn_list_locations(ARRAY[1,2,3]::integer[]);
