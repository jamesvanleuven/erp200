CREATE OR REPLACE FUNCTION public.rtn_products_global(
	_location integer,
    _establishment integer,
	_filter text
) RETURNS TABLE (result json) 
LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_location ALIAS FOR $1;
    _establishment ALIAS FOR $2;
	_filter ALIAS FOR $3;
	sql character varying;

	BEGIN
    
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_products;

    sql := 'SELECT array_to_json(array_agg(row_to_json(t))) FROM ('
        || 'SELECT'
        || ' a.id, a.product_id, a.manufacturer_id'
        || ', (SELECT * FROM rtn_element_text(62, a.products)) AS "product"'
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
        || ', (SELECT COUNT(c.*) FROM matview_products c WHERE c.location_id = '
        || quote_literal(_location)
        || ' AND c.manufacturer_id = '
        || quote_literal(_establishment)
        || ') AS "totalRecords"'
        || ', a.created, a.active'
        || 'FROM matview_customers a WHERE ('
        || 'a.products::text ~* '
        || _filter 
        || ' OR a.upc::text ~* '
        || _filter
        || ' OR a.sku::text ~* '
        || _filter
        || ' AND a.active = true) ORDER BY a.products, a.sku, a.upc) t;';
    
    RETURN QUERY EXECUTE sql;

	END;

$function$;

-- SELECT * FROM rtn_products_global('1', '9924', '^[JOLLY BEGGAR|$697].*'::text);