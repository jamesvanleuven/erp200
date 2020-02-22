CREATE OR REPLACE FUNCTION public.rtn_customer(
	_customer integer
) RETURNS TABLE (
	result json
) LANGUAGE plpgsql
AS $function$

	BEGIN

		RETURN QUERY (
			SELECT row_to_json(t) 
			FROM (
				SELECT 
					a.id,
					a.customers AS customer,
					a.license_number,
					a.customer_type_id,
					a.customer_types,
					a.delivery_days,
					a.street,
					a.city,
					a.zipcode
				FROM matview_customers a WHERE id = _customer
			) t
		);
	
	END;

$function$;

SELECT * FROM public.rtn_customer(16204);