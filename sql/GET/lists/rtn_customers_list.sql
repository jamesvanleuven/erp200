CREATE OR REPLACE FUNCTION public.rtn_customers_list(_customers integer[])
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN
		IF _customers = ARRAY[0]::integer[] OR _customers = '{}'
		THEN
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT
						a.id,
						a.key AS channel,
						a.customers AS "value",
						a.store_number,
						(
							SELECT row_to_json(x7) 
							FROM (
									SELECT 
										a.license_type_id AS id,
										a.license_number AS number,
										a.license_types AS type
							) x7
						) AS license,
						(
							SELECT row_to_json(x6) 
							FROM (
									SELECT 
										a.customer_type_id AS id,
										a.customer_types AS value,
										a.customer_abbr AS abbr
							) x6
						) AS "type",
						(
							SELECT row_to_json(x2)
							FROM (
									SELECT 
										(
											SELECT row_to_json(y1)
											FROM (
												SELECT id, street AS "value" FROM sys_addresses WHERE id = a.address_id
											) y1
										) AS "street",
										(
											SELECT row_to_json(y2) 
											FROM (
												SELECT id, township AS "value" FROM sys_municipalities WHERE id = a.city_id
											) y2
										) AS "city",
										(
											SELECT row_to_json(y3) 
											FROM (
												SELECT id, iso, category, name_en AS "value", name_fr FROM sys_provinces WHERE id = a.state_id
											) y3
										) AS "state",
										a.zipcode
							) x2
						) AS "address",
						a.opens AS opens_at,
						a.closes AS closes_at,
						a.delivery_days
					FROM public.matview_customers a 
					WHERE a.active = true
					ORDER BY a.customers
				) t
			);
		ELSE
		
			RETURN QUERY (
				SELECT array_to_json(array_agg(row_to_json(t)))
				FROM(
					SELECT
						a.id,
						a.key AS channel,
						a.customers AS "value",
						a.store_number,
						(
							SELECT row_to_json(x7) 
							FROM (
									SELECT 
										a.license_type_id AS id,
										a.license_number AS number,
										a.license_types AS type
							) x7
						) AS license,
						(
							SELECT row_to_json(x6) 
							FROM (
									SELECT 
										a.customer_type_id AS id,
										a.customer_types AS value,
										a.customer_abbr AS abbr
							) x6
						) AS "type",
						(
							SELECT row_to_json(x2)
							FROM (
									SELECT 
										(
											SELECT row_to_json(y1)
											FROM (
												SELECT id, street AS "value" FROM sys_addresses WHERE id = a.address_id
											) y1
										) AS "street",
										(
											SELECT row_to_json(y2) 
											FROM (
												SELECT id, township AS "value" FROM sys_municipalities WHERE id = a.city_id
											) y2
										) AS "city",
										(
											SELECT row_to_json(y3) 
											FROM (
												SELECT id, iso, category, name_en AS "value", name_fr FROM sys_provinces WHERE id = a.state_id
											) y3
										) AS "state",
										a.zipcode
							) x2
						) AS "address",
						a.opens AS opens_at,
						a.closes AS closes_at,
						a.delivery_days
					FROM UNNEST(ARRAY[_customers]::integer[]) id(id) 
					LEFT OUTER JOIN matview_customers a ON a.id = id.id 
					ORDER BY a.customers
				) t
			);
		END IF;
	END;

$function$;