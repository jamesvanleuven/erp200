--  TRUNCATE import_products;

DROP FUNCTION IF EXISTS public.import_products(
	bigint,
	bigint,
	bigint,
	character varying,
	bigint,
	character varying,
	bigint,
	character varying,
	bigint,
	character varying,
	character varying,
	character varying,
	bigint,
	character varying,
	bigint,
	character varying,
	numeric,
	integer,
	integer,
	numeric,
	numeric,
	numeric,
	numeric,
	numeric,
	timestamp(6) without time zone
);

CREATE OR REPLACE FUNCTION public.import_products(
	_id bigint,
	_manufacturer_id bigint,
	_batch_id character varying, 
	_batch_name character varying,
	_upc bigint,
	_ltr_btl numeric,
	_btl_su integer,
	_btl_cs integer,
	_litter_rate numeric,
	_pct_alc numeric,
	_name character varying,
	_price_eff_date timestamp(6) without time zone,
	_category_1 character varying,
	_category_2 character varying,
	_mfr_price numeric,
	_retail_price numeric,
	_warehouse_price numeric,
	_sku character varying
) RETURNS TABLE (
	id bigint,
	product_id bigint,
	inventory_id bigint,
	product character varying,
	manufacturer_id bigint,
	manufacturer character varying,
	location_id bigint,
	locations character varying,
	sku bigint,
	upc character varying,
	batch_id character varying,
	batch_name character varying,
	product_type_id bigint,
	product_type character varying,
	package_type_id bigint,
	package_type character varying,
	litres_per_bottle numeric,
	bottles_per_sku integer,
	bottles_per_case integer,
	alcohol_percentage numeric,
	litter_rate numeric,
	mfr_price numeric,
	ws_price numeric,
	rtl_price numeric,
	created timestamp(6) without time zone
) LANGUAGE plpgsql
AS $function$

DECLARE
	_ins_manufacturer_id bigint := 362; -- MANUFACTURER ID VARIABLE
	_ins_product_id bigint; -- PRODUCT ID VARIABLE
	_ins_batch_id bigint; -- BATCH ID VARIABLE
	_ins_location_id integer; -- LOCATION ID VARIABLE
	_ins_wh_location integer[] := ARRAY[1,2,3,4]; -- WAREHOUSE LOCATION_ID'S VARIABLE
	_ins_inventory_id bigint; -- INSERTED INVENTORY ID
	_ins_invArray integer[];
	_ins_i integer; -- LOOP COUNTER VARIABLE

BEGIN

	-- RETURN MANUFACTURER HWH LOCATION ID
	SELECT id FROM crm_locations WHERE establishment_id = _manufacturer_id INTO _ins_location_id;
	
	-- APPEND MANUFACTURER HOME WAREHOUSE LOCATION ID INTO INVENTORY ARRAY
	_ins_wh_location := ARRAY_APPEND(_ins_wh_location, _ins_location_id);

	-- INSERT PRODUCT WITH UNIQUE SKU FOR MANUFACTURER
	INSERT INTO pim_products (
		sku
		, manufacturer_id
		, agent_number
	) 
	SELECT DISTINCT 
	ON (substring(CAST(a.sku AS character varying) from '^\d+')::bigint) 
		substring(CAST(a.sku AS character varying) from '^\d+')::bigint
		, _manufacturer_id
		, (
			SELECT 
				m.license_number 
			FROM crm_establishments m
			WHERE m.id = _manufacturer_id
		)
	FROM import_products a
	LEFT JOIN pim_products b 
	ON b.sku::bigint <> substring(CAST(a.sku AS character varying) from '^\d+')::bigint
	WHERE (
		b.sku <> substring(CAST(a.sku AS character varying) from '^\d+')::bigint 
		AND 
		b.manufacturer_id = _manufacturer_id
	)
	RETURNING id INTO _ins_product_id;

	-- INSERT BATCH ITEM FOR EACH PRODUCT UNIQUE SKU
	INSERT INTO pim_batch (	
		product_id, 
		name, 
		upc, 
		sku,
		batch_id,
		batch_name,
		litres_per_bottle, 
		bottles_per_skid, 
		bottles_per_case,
		alcohol_percentage,
		litter_rate,
		mfr_price,
		rtl_price,
		sp_price,
		ws_price,
		active
	)
	SELECT 
		b.id,
		a.name,
		a.upc,
		b.sku,
		substring(CAST(a.sku AS character varying) from '[a-zA-Z][a-zA-Z0-9]*$')::character varying AS batch_id,
		a.batch_name,
		a.ltr_btl,
		a.btl_su,
		a.btl_cs,
		a.pct_alc,
		a.litter_rate,
		a.mfr_price,
		a.retail_price,
		a.special_price,
		a.warehouse_price,
		a.active
	FROM import_products a 
	LEFT OUTER JOIN pim_products b 
		ON b.sku = substring(CAST(a.sku AS character varying) from '^\d+')::bigint 
	WHERE b.id = _ins_product_id
	RETURNING id INTO _ins_batch_id;

	-- INSERT INVENTORY FOR EACH WAREHOUSE LOCATION
	FOREACH _ins_i IN ARRAY _ins_wh_location 
	LOOP
	
		INSERT INTO pim_inventory(
			product_id
			, batch_id
			, location_id
			, manufacturer_id
		)
		SELECT DISTINCT ON (b.id)
			_ins_product_id
			, _ins_batch_id
			, _i
			, _manufacturer_id
		FROM import_products a 
		LEFT OUTER JOIN pim_products b on b.sku = substring(CAST(a.sku AS character varying) from '^\d+')::bigint 
		LEFT OUTER JOIN pim_batch c ON c.sku = substring(CAST(a.sku AS character varying) from '^\d+')::bigint
		RETURNING id INTO _ins_inventory_id;
		
		_ins_invArray := ARRAY_APPEND(_ins_invArray, _ins_inventory_id);
		
	END LOOP;
	
	-- REFRESH THE PRODUCTS MATERIALIZED VIEW
	REFRESH MATERIALIZED VIEW public.matview_products;
	REFRESH MATERIALIZED VIEW public.matview_orders;
	REFRESH MATERIALIZED VIEW public.matview_transfers;
	
	RETURN QUERY (
		SELECT 
			id::bigint,
			product_id::bigint,
			inventory_id::bigint,
			product::character varying,
			manufacturer_id::bigint,
			manufacturer::character varying,
			location_id::bigint,
			locations::character varying,
			sku::bigint,
			upc::character varying,
			batch_id::character varying,
			batch_name::character varying,
			product_type_id::bigint,
			product_type::character varying,
			package_type_id::bigint,
			package_type::character varying,
			litres_per_bottle::numeric(10,4),
			bottles_per_sku::integer,
			bottles_per_case::integer,
			alcohol_percentage::numeric(10,4),
			litter_rate::numeric(10,2),
			mfr_price::numeric(10,2),
			ws_price::numeric(10,2),
			rtl_price::numeric(10,2),
			created::timestamp(6) without time zone
		FROM 
			matview_products
		WHERE (
			inventory_id IN(SELECT(UNNEST(ARRAY[_ins_invArray]::bigint[]))) -- ALL IMPORTED PRODUCTS
			AND 
			location_id IN(SELECT(UNNEST(ARRAY[_ins_wh_location]::bigint[]))) -- ALL WH LOCATIONS
		)
	);
	
END; 

$function$;