CREATE OR REPLACE FUNCTION public.rtn_document_types(_customers integer[])
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$

	BEGIN

		RETURN QUERY (
			SELECT array_to_json(array_agg(t)) 
			FROM (
				SELECT 
					id.id,
					a.key AS channel,	
					a.customers AS value,
					a.store_number,
					(
						SELECT row_to_json(c) 
						FROM(
							SELECT
							b.id,
							b.name AS value,
							b.abbr
						) c
					) AS type,
					(
						SELECT row_to_json(l) 
						FROM(
							SELECT 
								a.license_type_id AS id,
								a.license_number AS number,
								a.license_types AS value
						) l
					) AS license,
					(
						SELECT row_to_json(a)
						FROM (
							SELECT 
								a.street,
								a.city,
								a.state,
								a.zipcode
						) a
					) AS address,
					a.delivery_days
				FROM unnest(_customers) id(id)
				LEFT OUTER JOIN matview_customers a ON a.id = id.id 
				LEFT OUTER JOIN crm_customer_types b ON b.id = a.customer_type_id 
				ORDER BY a.id
			) t
		);

	END;
    
$function$;