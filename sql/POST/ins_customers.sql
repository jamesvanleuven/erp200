DROP FUNCTION IF EXISTS public.ins_customers(
	_license_number bigint
	, _customers character varying
	, _establishment_type bigint
	, _customer_type bigint
	, _license_type bigint
	, _municipalities bigint
	, _provinces bigint
	, _street character varying
	, _zipcode character varying
	, _opens time without time zone
	, _closes time without time zone
	, _delivery_days json
	, _notes json
	, _active boolean
);

CREATE OR REPLACE FUNCTION public.ins_customers(
	_license_number bigint
	, _customers character varying
	, _establishment_type bigint
	, _customer_type bigint
	, _license_type bigint
	, _municipalities bigint
	, _provinces bigint
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
	a_id integer; -- ADDRESS ID
	c_id integer; -- CUSTOMER ID
	l_id integer; -- LOCATION ID
BEGIN

-- INSERT SYSTEM ADDRESS
	IF _street IS NOT NULL THEN 
		INSERT INTO public.sys_addresses(
			type_id
			, street
			, city_id
		)VALUES(
			8
			, _street
			, _municipalities
		) RETURNING id INTO a_id;
	END IF;

	-- INSERT CUSTOMER
	INSERT INTO public.crm_establishments(
		license_number,
		"name",
		establishment_type_id,
		customer_type_id,
		license_type_id,
		state_id,
		city_id,
		address_id,
		zipcode,
		opens,
		closes,
		delivery_days,
		notes,
		active
	) VALUES (
		_license_number
		, _customers
		, _establishment_type
		, _customer_type
		, _license_type
		, _provinces
        , _municipalities
		, a_id
		, _zipcode
		, _opens
		, _closes
		, _delivery_days
		, _notes
		, _active
	) RETURNING id INTO c_id;

	-- REFRESH MATERIALZED VIEWS
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_addresses;
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_customers;

	RETURN QUERY ( SELECT row_to_json(t) FROM (
		SELECT * FROM matview_customers WHERE id::bigint = c_id::bigint
		) t
	);

END;

$function$;


SELECT * FROM public.ins_customers(

	195318::bigint
	, 'Everything Wine - River District'::character varying
	, 4::bigint
	, 3::bigint
	, 1130::bigint
	, 2::bigint
	, '8570 River District Crossing'::character varying
	, 'V5S 4V9'::character varying
	, '07:00:00'::time without time zone
	, '17:00:00'::time without time zone
	, '[{"deliver":false,"hours":{"start":"07:00:00","end":"17:00:00"}},{"deliver":false,"hours":{"start":"07:00:00","end":"17:00:00"}},{"deliver":true,"hours":{"start":"07:00:00","end":"17:00:00"}},{"deliver":true,"hours":{"start":"07:00:00","end":"17:00:00"}},{"deliver":true,"hours":{"start":"07:00:00","end":"17:00:00"}},{"deliver":true,"hours":{"start":"07:00:00","end":"17:00:00"}},{"deliver":false,"hours":{"start":"07:00:00","end":"17:00:00"}}]'::json
	, '{}'::json
	, True::boolean
	
);
