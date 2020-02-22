DROP FUNCTION IF EXISTS public.upd_products(
	_id bigint
	, _product_id bigint
	, _manufacturer_id bigint
	, _product character varying
	, _batch_id integer
	, _batch_name character varying
	, _upc character varying
	, _sku bigint
	, _product_type integer
	, _package_type integer
	, _litres_per_bottle numeric
	, _bottles_per_case integer
	, _bottles_per_sku integer
	, _litter_rate numeric
	, _mfr_price numeric
	, _rtl_price numeric
	, _ws_price numeric
	, _notes json
);

CREATE OR REPLACE FUNCTION public.upd_products(
	_id bigint
	, _product_id bigint
	, _manufacturer_id bigint
	, _product character varying
	, _batch_id integer
	, _batch_name character varying
	, _upc character varying
	, _sku bigint
	, _product_type integer
	, _package_type integer
	, _litres_per_bottle numeric
	, _bottles_per_case integer
	, _bottles_per_sku integer
	, _litter_rate numeric
	, _mfr_price numeric
	, _rtl_price numeric
	, _ws_price numeric
	, _notes json
) RETURNS TABLE (
	results json
) LANGUAGE plpgsql
AS $function$
DECLARE
	p_id integer;
	b_id integer;
BEGIN

	UPDATE public.pim_products 
		SET
			manufacturer_id = _manufacturer_id,
			sku = _sku 
	WHERE id = _product_id RETURNING id INTO p_id;

    UPDATE pim_batch 
		SET 
			name = _product, 
			batch_id = _batch_id, 
			batch_name = _batch_name,
			sku = _sku, 
			upc = _upc, 
			category_1 = _product_type, 
			category_2 = _package_type,
			litres_per_bottle = _litres_per_bottle, 
			bottles_per_case = _bottles_per_case, 
			bottles_per_skid = _bottles_per_sku, 
			litter_rate = _litter_rate,
			ws_price = _ws_price, 
			mfr_price = _mfr_price, 
			rtl_price = _rtl_price,
			notes = _notes
	WHERE id = _id RETURNING id INTO b_id;


	REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_products;
	
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
