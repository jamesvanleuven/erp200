CREATE OR REPLACE FUNCTION public.ins_batch(
	_product_id bigint,
	_manufacturer_id bigint,
	_sku bigint,
	_location_id bigint,
	_upc character varying,
	_batch_id integer,
	_batch_name character varying,
	_product character varying,
	_litres_per_bottle numeric,
	_bottles_per_skid integer,
	_alcohol_percentage numeric,
	_litter_rate numeric,
	_mfr_price numeric,
	_rtl_price numeric,
	_ws_price numeric,
	_product_type integer,
	_package_type integer,
	_quantity integer,
	_notes json
) RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
--	p_id integer;
	b_id integer;
    i_id integer;
BEGIN

/*
	INSERT INTO public.pim_products(
		manufacturer_id,
		sku
	) VALUES (
		_manufacturer_id,
		_sku
	) RETURNING id INTO p_id;
*/

	INSERT INTO public.pim_batch(
		product_id,
		upc,
		batch_id,
		batch_name,
		name,
		litres_per_bottle,
		bottles_per_skid,
		bottles_per_case,
		litter_rate,
		mfr_price,
		rtl_price,
		ws_price,
		sku,
		category_1,
		category_2,
		notes
	) VALUES (
		_product_id,
		_upc,
		_batch_id,
		_batch_name,
		_product,
		_litres_per_bottle,
		_bottles_per_skid,
		_bottles_per_case,
		_litter_rate,
		_mfr_price,
		_rtl_price,
		_ws_price,
		_sku,
		_product_type,
		_package_type,
		_notes
	) RETURNING id INTO b_id;


	INSERT INTO public.pim_inventory(
		product_id,
		batch_id,
		location_id,
		manufacturer_id,
		quantity
	) VALUES (
		p_id,
		b_id,
		_location_id,
		_manufacturer_id,
		_quantity
	) RETURNING id INTO i_id;

    RETURN i_id;

END;

$function$;
