CREATE OR REPLACE FUNCTION public.rtn_manufacturers_list(_manufacturers integer[])
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		IF _manufacturers = ARRAY[0]::integer[] OR _manufacturers = '{}'
		THEN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				--SELECT row_to_json(t)
				FROM(
					SELECT 
						a.id,
						a.auto_invoicing,
						a.manufacturers AS "value",
						a.store_number,
						a.delivery_days,
						(
							SELECT row_to_json(aa) FROM (
								SELECT
									a.zipcode
									, a.street
									, (
										SELECT row_to_json(ss) FROM (
											SELECT
												a.address_id AS id
												, a.street AS value
										) ss
									) AS street
									, (
										SELECT row_to_json(cc) FROM (
											SELECT 
												a.city_id AS id
												, a.city AS value
										) cc
									) AS city
									, (
										SELECT row_to_json(pp) FROM (
											SELECT 
												a.state_id AS id
												, a.state AS value
										) pp
									) AS province
							) aa
						) AS address
						, false AS "hwh"
						, 0 AS "hwh_id"
					FROM public.matview_manufacturers a 
					WHERE a.id = 0 AND a.active = true
					ORDER BY a.manufacturers
				) t
			);
		ELSE
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				-- SELECT row_to_json(t)
				FROM(
					SELECT
						a.id,
						a.auto_invoicing,
						a.manufacturers AS "value",
						a.delivery_days,
						a.store_number,
						(
							SELECT row_to_json(aa) FROM (
								SELECT
									a.zipcode
									, a.street
									, (
										SELECT row_to_json(ss) FROM (
											SELECT
												a.address_id AS id
												, a.street AS value
										) ss
									) AS street
									, (
										SELECT row_to_json(cc) FROM (
											SELECT 
												a.city_id AS id
												, a.city AS value
										) cc
									) AS city
									, (
										SELECT row_to_json(pp) FROM (
											SELECT 
												a.state_id AS id
												, a.state AS value
										) pp
									) AS province
							) aa
						) AS address,
						true AS "hwh",
						(SELECT aa.id FROM matview_locations aa WHERE aa.establishment_id = a.id) AS "hwh_id"
					FROM UNNEST(ARRAY[_manufacturers]::integer[]) id(id)
					LEFT OUTER JOIN matview_manufacturers a ON a.id = id.id
					WHERE a.active = true
					ORDER BY id.id
				) t
			);
		END IF;
	END;

$function$;