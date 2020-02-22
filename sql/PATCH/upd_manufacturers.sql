DROP FUNCTION IF EXISTS public.upd_manufacturers(
	bigint
	, bigint
	, bigint
	, character varying
	, bigint
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
	, boolean
);

CREATE OR REPLACE FUNCTION public.upd_manufacturers(
	_id bigint
	, _store_number bigint
	, _license_number bigint
	, _manufacturers character varying
	, _establishment_types bigint
	, _license_types bigint
	, _license_sub_types bigint
	, _municipalities bigint
	, _provinces bigint
	, _address_id bigint
	, _street character varying
	, _zipcode character varying
	, _opens time without time zone
	, _closes time without time zone
	, _delivery_days json
	, _notes json
	, _auto_invoicing boolean
	, _active boolean
)
 RETURNS TABLE (
 	results json
 ) LANGUAGE plpgsql
AS $function$
DECLARE
	a_id integer;
	m_id integer;
	insertId integer;
BEGIN

	IF _address_id = -1 THEN
	
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

	UPDATE public.crm_establishments 
		SET 
			license_number = _license_number,
			store_number = _store_number,
			name = _manufacturers,
			address_id = a_id,
			city_id = _municipalities,
			state_id = _provinces,
			zipcode = _zipcode,
			establishment_type_id = _establishment_types,
			license_type_id = _license_types,
			license_sub_type_id = _license_sub_types,
			opens = _opens,
			closes = _closes,
			delivery_days = _delivery_days,
			notes = _notes,
			auto_invoicing = _auto_invoicing,
			active = _active 
	WHERE id = _id 
	RETURNING id INTO m_id;

	REFRESH MATERIALIZED VIEW public.matview_addresses;
	REFRESH MATERIALIZED VIEW public.matview_locations;
	REFRESH MATERIALIZED VIEW public.matview_manufacturers;

	RETURN QUERY (
		SELECT row_to_json(t) FROM (
			SELECT *
			FROM matview_manufacturers
			WHERE id = _id
		) t
	);

END;

$function$;