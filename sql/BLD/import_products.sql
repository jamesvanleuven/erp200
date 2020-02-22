DO $$

DECLARE
	m_id integer;
	p_id integer; -- PRODUCT ID VARIABLE
	b_id integer; -- BATCH ID VARIABLE
	l_id integer; -- LOCATION ID VARIABLE
	whl integer[] := ARRAY[1,2,3,4]; -- WAREHOUSE LOCATION_ID'S VARIABLE
	i integer; -- LOOP COUNTER VARIABLE

BEGIN

	SELECT 110 INTO m_id; -- MANUFACTURER ID
	SELECT id FROM crm_locations WHERE establishment_id = m_id INTO l_id; -- MANUFACTURER HWH
	
	whl := ARRAY_APPEND(whl, l_id);

	INSERT INTO pim_products (sku, manufacturer_id, agent_number)
	SELECT DISTINCT ON (substring(CAST(a.sku AS text) from '^\d+')::bigint) 
		(substring(CAST(a.sku AS text) from '^\d+')::bigint) AS sku
		, m_id
		, (SELECT license_number FROM crm_establishments WHERE id = m_id)
	FROM import_products a
	LEFT JOIN pim_products b ON b.sku::bigint <> substring(CAST(a.sku AS text) from '^\d+')::bigint
	WHERE (
		b.sku::bigint <> substring(CAST(a.sku AS text) from '^\d+')::bigint 
		AND 
		b.manufacturer_id = m_id
	)
	RETURNING id INTO p_id;

	INSERT INTO pim_batch (	
		product_id, 
		upc, 
		sku,
		batch_id,
		name,
		litres_per_bottle, 
		bottles_per_skid, 
		bottles_per_case,
		litter_rate,
		mfr_price,
		rtl_price,
		ws_price,
		category_1,
		category_2
	)
	SELECT 
		p_id,
		a.upc,
		substring(CAST(a.sku AS text) from '^\d+')::bigint AS sku,
		substring(CAST(a.sku AS text) from '[a-zA-Z][a-zA-Z0-9]*$')::character varying AS batch_id,
		a.product_name::character varying,
		a.ltr_btl::numeric(10,4),
		a.btl_sku::integer,
		a.btl_case::integer,
		a.deposit::numeric(10,4),
		a.mfr_price::numeric(10,2),
		a.rtl_price::numeric(10,2),
		a.ws_price::numeric(10,2),
		a.product_type::bigint,
		a.package_type::bigint
	FROM import_products a 
	LEFT OUTER JOIN pim_products b on b.sku::bigint = substring(CAST(a.sku AS text) from '^\d+')::bigint RETURNING id INTO b_id;

-- LOCATION_ID IN THE WAREHOUSE ARRAY
	FOREACH i IN ARRAY whl 
	LOOP
	
		INSERT INTO pim_inventory(
			product_id
			, batch_id
			, location_id
			, manufacturer_id
		)
		SELECT DISTINCT ON (b.id)
			c.product_id
			, c.id
			, i
			, m_id
		FROM import_products a 
		LEFT OUTER JOIN pim_products b on b.sku::bigint = substring(CAST(a.sku AS text) from '^\d+')::bigint 
		LEFT OUTER JOIN pim_batch c ON c.sku::bigint = substring(CAST(a.sku AS text) from '^\d+')::bigint;
		
	END LOOP;
    
	-- REFRESH THE PRODUCTS MATERIALIZED VIEW
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_products;
    
END$$;
