CREATE OR REPLACE FUNCTION public.rtn_products(

	_limit integer, 
	_offset integer, 
	_establishment integer, 
	_location integer, 
	_filter character varying
	
) RETURNS TABLE(

	result json
	
) LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_establishment ALIAS FOR $3;
	_location ALIAS FOR $4;
	_filter ALIAS FOR $5;
	sql character varying;

	BEGIN
		
		REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_products;

		sql := 'SELECT array_to_json(array_agg(row_to_json(t)))'
			|| ' FROM (SELECT a.id, a.product_id, a.manufacturer_id'
			|| ', (SELECT * FROM rtn_element_text(47, a.product)) AS "product"'
			|| ', (SELECT * FROM rtn_element_text(32, a.batch_id)) AS "batch_number"'
			|| ', (SELECT * FROM rtn_element_text(33, a.batch_name)) AS "batch_name"'
			|| ', (SELECT * FROM rtn_element_text(16, a.upc)) AS "upc"'
			|| ', (SELECT * FROM rtn_element_bigint(15, a.sku)) AS "sku"'
			|| ', (SELECT * FROM rtn_element_select(60, a.product_type, a.product_type_id)) AS "product_type"'
			|| ', (SELECT * FROM rtn_element_select(61, a.package_type, a.package_type_id)) AS "package_type"'
			|| ', (SELECT * FROM rtn_element_float(17, a.litres_per_bottle)) AS "litres_per_bottle"'
			|| ', (SELECT * FROM rtn_element_integer(23, a.bottles_per_case)) AS "bottles_per_case"'
			|| ', (SELECT * FROM rtn_element_integer(18, a.bottles_per_skid)) AS "bottles_per_sku"'
			|| ', (SELECT * FROM rtn_element_money(20, a.litter_rate)) AS "litter_rate"'
			|| ', (SELECT * FROM rtn_element_money(24, a.mfr_price)) AS "manufacturer_price"'
			|| ', (SELECT * FROM rtn_element_money(25, a.rtl_price)) AS "retail_price"'
			|| ', (SELECT * FROM rtn_element_money(26, a.ws_price)) AS "wholesale_price"'
			|| ', (SELECT * FROM rtn_element_integer(21, a.quantity)) AS "quantity"'
			|| ', (SELECT * FROM rtn_element_json(76, a.notes)) AS "notes"'
			|| ' FROM matview_products a WHERE a.manufacturer_id = '
			|| quote_literal(_establishment)
			|| ' AND a.location_id = '
			|| _location;

		IF _filter IS NOT NULL THEN
			sql := sql || ' ' || _filter || ' ORDER BY a.id Desc';
		ELSE
			sql := sql || ' ORDER BY a.id Desc';
		END IF;
		
		IF _limit > 0 THEN
			sql := sql || ' OFFSET ' || _offset
				|| ' FETCH NEXT ' || _limit
				|| ' ROWS ONLY) t;';
		ELSE
			sql := sql || ') t;';
		END IF;

		RETURN QUERY EXECUTE sql;

	END;
	
$function$;

SELECT * FROM rtn_products(
	25
	, 0
	, 9924
	, 1
	, NULL
);