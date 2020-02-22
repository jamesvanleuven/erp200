DROP FUNCTION IF EXISTS public.upd_customers(
	bigint
	, bigint
	, character varying
	, bigint
	, bigint
	, bigint
	, bigint
	, bigint
	, character varying
	, character varying
	, time without time zone
	, time without time zone
	, json
	, json
	, boolean
);

CREATE OR REPLACE FUNCTION public.upd_customers(
	_id bigint
	, _license_number bigint
	, _customers character varying
	, _customer_type bigint
	, _license_type bigint
	, _municipalities bigint
	, _provinces bigint
	, _address_id bigint
	, _street character varying
	, _zipcode character varying
	, _opens time without time zone
	, _closes time without time zone
	, _delivery_days json
	, _notes json
	, _active boolean
) RETURNS TABLE (
	results json
) LANGUAGE plpgsql
AS $function$
DECLARE
	a_id integer;
	c_id integer;
    companyName text;
BEGIN

	companyName = NULL;
	
	
	-- UPDATE CUSTOMER ADDRESS
	IF _address_id <= 0 THEN
	
		INSERT INTO public.sys_addresses (
			street
			, city_id
		)VALUES(
			_street
			, _municipalities
		) RETURNING id INTO a_id;
	
	ELSE
	
		UPDATE public.sys_addresses 
			SET 
				street = _street, 
				city_id = _municipalities 
			WHERE id = _address_id RETURNING id INTO a_id;
	
	END IF;

	-- INSERT CUSTOMER
	UPDATE public.crm_establishments 
		SET 
			license_number = _license_number,
			name = _customers,
			customer_type_id = _customer_type,
			license_type_id = _license_type,
			city_id = _municipalities,
			state_id = _provinces,
			address_id = a_id,
			zipcode = _zipcode,
			opens = _opens,
			closes = _closes,
			delivery_days = _delivery_days,
			notes = _notes,
			active = _active 
	WHERE id = _id 
	RETURNING id INTO c_id;

	-- REFRESH MATERIALZED VIEWS
	REFRESH MATERIALIZED VIEW public.matview_addresses;
	REFRESH MATERIALIZED VIEW public.matview_customers;
	
	RETURN QUERY (
		SELECT row_to_json(t) FROM (
			SELECT *
			FROM matview_customers
			WHERE id = _id
		) t
	);

END;

$function$;