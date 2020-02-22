DROP FUNCTION IF EXISTS public.ins_products(
	_manufacturer_id bigint
	, _sku bigint
	, _upc character varying
	, _product character varying
	, _litres_per_bottle numeric
	, _bottles_per_skid integer
	, _bottles_per_case integer
	, _litter_rate numeric
	, _mfr_price numeric
	, _rtl_price numeric
	, _ws_price numeric
	, _product_type integer
	, _package_type integer
	, _notes json
);

CREATE OR REPLACE FUNCTION public.ins_products(
	_manufacturer_id bigint
	, _sku bigint
	, _upc character varying
	, _product character varying
	, _litres_per_bottle numeric
	, _bottles_per_skid integer
	, _bottles_per_case integer
	, _litter_rate numeric
	, _mfr_price numeric
	, _rtl_price numeric
	, _ws_price numeric
	, _product_type integer
	, _package_type integer
	, _notes json
) RETURNS TABLE (
	results json
) LANGUAGE plpgsql
AS $function$

DECLARE
	p_id integer; -- PRODUCT ID VARIABLE
	b_id integer; -- BATCH ID VARIABLE
	l_id integer; -- LOCATION ID VARIABLE
	_whl integer[] := ARRAY[1,2,3,4]; -- WAREHOUSE LOCATION_ID'S VARIABLE
	i integer; -- LOOP COUNTER VARIABLE
BEGIN

-- RETURN HWH ID INTO l_id (location_id)
	SELECT 
		a.id 
	FROM crm_locations a 
	WHERE a.establishment_id = _manufacturer_id 
	INTO l_id;
	
	-- APPEND HWH TO ARRAY
	_whl := ARRAY_APPEND(_whl, l_id);

-- INSERT INTO PIM_PRODUCTS   
	INSERT INTO public.pim_products(
		manufacturer_id
		, sku
	)VALUES(
		_manufacturer_id
		, _sku
	) RETURNING id INTO p_id; -- PRODUCT INSERT ID

-- INSERT INTO PIM_BATCH WITH PIM_PRODUCTS.ID    
	INSERT INTO public.pim_batch(
		product_id,
		upc,
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
		p_id,
		_upc,
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
	) RETURNING id INTO b_id; -- BATCH INSERT ID

-- INSERT PRODUCT INTO INVENTORY FOR EACH 
-- LOCATION_ID IN THE WAREHOUSE ARRAY
	FOREACH i IN ARRAY _whl 
	LOOP
	
		INSERT INTO pim_inventory(
			product_id
			, batch_id
			, location_id
			, manufacturer_id
		)VALUES(
			p_id
			, b_id
			, i
			, _manufacturer_id
		);
		
	END LOOP;
    
	-- REFRESH THE PRODUCTS MATERIALIZED VIEW
    REFRESH MATERIALIZED VIEW public.matview_products;
    
	RETURN QUERY (
		SELECT row_to_json(t) 
		FROM (
			SELECT * 
			FROM matview_products 
			WHERE product_id::bigint = p_id::bigint AND batch_id::bigint = b_id::bigint 
			LIMIT 1
		) t
	);

END;

$function$;