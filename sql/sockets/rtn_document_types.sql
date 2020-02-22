CREATE OR REPLACE FUNCTION public.rtn_document_types(
    _customers integer[]
)
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
					a.customers AS customer,
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
								a.license_number,
								a.license_types AS value
						) l
					) AS license,
--					b.id,
--					b.name as value,
--					a.license_type_id,
--					a.license_types,
					(
						SELECT row_to_json(a)
						FROM (
							SELECT 
								a.street,
								a.city,
								a.state,
								a.zipcode,
								a.delivery_days
						) a
					) AS address
--					a.address || ' ' || a.zipcode AS address
				FROM unnest(_customers) id(id)
				LEFT OUTER JOIN matview_customers a ON a.id = id.id 
				LEFT OUTER JOIN crm_customer_types b ON b.id = a.customer_type_id
			) t
		);

	END;
    
$function$;