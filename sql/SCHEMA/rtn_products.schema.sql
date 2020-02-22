DROP FUNCTION IF EXISTS rtn_products_schema();

CREATE OR REPLACE FUNCTION public.rtn_products_schema() RETURNS TABLE (
	result json
) LANGUAGE plpgsql
AS $function$ 

DECLARE 
	sql character varying;

	BEGIN
		
		REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_products;

		sql := 'SELECT row_to_json(t)'
			|| ' FROM (SELECT a.id, NULL AS product_id, a.manufacturer_id'
			|| ', (SELECT * FROM rtn_element_text(47, NULL)) AS "product"'
			|| ', (SELECT * FROM rtn_element_text(32, NULl)) AS "batch_number"'
			|| ', (SELECT * FROM rtn_element_text(33, NULL)) AS "batch_name"'
			|| ', (SELECT * FROM rtn_element_text(16, NULL)) AS "upc"'
			|| ', (SELECT * FROM rtn_element_bigint(15, NULL)) AS "sku"'
			|| ', (SELECT * FROM rtn_element_select(60, NULL, 0)) AS "product_type"'
			|| ', (SELECT * FROM rtn_element_select(61, NULL, 0)) AS "package_type"'
			|| ', (SELECT * FROM rtn_element_float(17, a.litres_per_bottle)) AS "litres_per_bottle"'
			|| ', (SELECT * FROM rtn_element_integer(23, a.bottles_per_case)) AS "bottles_per_case"'
			|| ', (SELECT * FROM rtn_element_integer(18, a.bottles_per_skid)) AS "bottles_per_sku"'
			|| ', (SELECT * FROM rtn_element_money(20, a.litter_rate)) AS "litter_rate"'
			|| ', (SELECT * FROM rtn_element_money(24, a.mfr_price)) AS "manufacturer_price"'
			|| ', (SELECT * FROM rtn_element_money(25, a.rtl_price)) AS "retail_price"'
			|| ', (SELECT * FROM rtn_element_money(26, a.ws_price)) AS "wholesale_price"'
			|| ', (SELECT * FROM rtn_element_integer(21, a.quantity)) AS "quantity"'
			|| ', (SELECT * FROM rtn_element_json(76, a.notes)) AS "notes"'
			|| ' FROM matview_products a'
			|| ' LIMIT 1) t;';

		RETURN QUERY EXECUTE sql;

	END;
	
$function$;

SELECT * FROM rtn_products_schema();
