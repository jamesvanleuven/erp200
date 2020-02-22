DROP FUNCTION IF EXISTS public.ins_manufacturers(
	_store_number bigint
	, _license_number bigint
	, _manufacturers character varying
	, _establishment_types bigint
	, _license_types bigint
	, _license_sub_types bigint
	, _municipalities bigint
	, _provinces bigint
	, _street character varying
	, _zipcode character varying
	, _opens time without time zone
	, _closes time without time zone
	, _delivery_days json
	, _notes json
	, _auto_invoicing boolean
	, _active boolean
);

CREATE OR REPLACE FUNCTION public.ins_manufacturers(
	_store_number bigint
	, _license_number bigint
	, _manufacturers character varying
	, _establishment_types bigint
	, _license_types bigint
	, _license_sub_types bigint
	, _municipalities bigint
	, _provinces bigint
	, _street character varying
	, _zipcode character varying
	, _opens time without time zone
	, _closes time without time zone
	, _delivery_days json
	, _notes json
	, _auto_invoicing boolean
	, _active boolean
) RETURNS TABLE ( 
	results json
) LANGUAGE plpgsql AS $function$

DECLARE
	a_id integer := NULL;
	m_id integer := NULL;
    l_id integer := NULL;
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
	
-- INSERT ESTABLISHMENT    
	INSERT INTO public.crm_establishments(
        license_number,
		store_number,
        name,
        address_id,
        city_id,
        state_id,
        zipcode,
        establishment_type_id,
        license_type_id,
		license_sub_type_id,
        opens,
        closes,
        delivery_days,
        notes, 
		auto_invoicing,
        active
	) VALUES (
		_license_number,
		_store_number,
        _manufacturers,
        a_id,
        _municipalities,
        _provinces,
		_zipcode,
        _establishment_types,
        _license_types,
		_license_sub_types,
        _opens,
        _closes,
        _delivery_days,
        _notes, 
		_auto_invoicing,
        True
	) RETURNING id INTO m_id;

-- INSERT TO LOCATIONS
	INSERT INTO crm_locations(
		establishment_id, 
		type_id, 
		name, 
		address_id
	)VALUES(
		m_id, 
		2, 
		_manufacturers, 
		a_id
	) RETURNING id INTO l_id;
	
	-- UPDATE MANUFACTURERS
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_addresses;
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_locations;
	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_manufacturers;

	RETURN QUERY ( SELECT row_to_json(t) FROM (
		SELECT * FROM matview_manufacturers WHERE id::bigint = m_id::bigint
		) t
	);

END;

$function$;