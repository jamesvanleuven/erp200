CREATE OR REPLACE FUNCTION public.rtn_products_filter(
	_limit integer, 
    _offset integer, 
    _establishment integer, 
    _location integer, 
    _filter character varying
) RETURNS TABLE(result json)
LANGUAGE plpgsql
AS $function$ 

DECLARE 
_limit ALIAS FOR $1;
_offset ALIAS FOR $2;
_establishment ALIAS FOR $3;
_location ALIAS FOR $4;
_filter ALIAS FOR $5;
sql character varying;

	BEGIN
		
		REFRESH MATERIALIZED VIEW public.matview_products;

		sql := 'SELECT array_to_json (ARRAY_AGG(row_to_json(t))) FROM ( SELECT row_to_json (t1) FROM (';
		sql := sql || ' SELECT a.batch_id, a.product_id,';
		sql := sql || ' (SELECT * FROM rtn_element_text(14::bigint, a.products::text)) AS "products",';
		sql := sql || ' (SELECT * FROM rtn_element_bigint(15::bigint, a.sku::bigint)) AS "sku",';
		sql := sql || ' (SELECT * FROM rtn_element_bigint(16::bigint, a.upc::bigint)) AS "upc",';
		sql := sql || ' (SELECT * FROM rtn_element_float(17::bigint, a.litres_per_bottle::numeric(10,4))) AS "litres_per_bottle",';
		sql := sql || ' (SELECT * FROM rtn_element_integer(23::bigint, a.bottles_per_case::integer)) AS "bottles_per_case",';
		sql := sql || ' (SELECT * FROM rtn_element_integer(18::bigint, a.bottles_per_skid::integer)) AS "bottles_per_skid",';
		sql := sql || ' (SELECT * FROM rtn_element_float(19::bigint, a.alcohol_percentage::numeric(10,2))) AS "alcohol_percentage",';
		sql := sql || ' (SELECT * FROM rtn_element_money(20::bigint, a.litter_rate::numeric(10,2))) AS "litter_rate",';
		sql := sql || ' (SELECT * FROM rtn_element_float(24::bigint, a.mfr_price::numeric(10,2))) AS "mfr_price",';
		sql := sql || ' (SELECT * FROM rtn_element_float(25::bigint, a.rtl_price::numeric(10,2))) AS "rtl_price",';
		sql := sql || ' (SELECT * FROM rtn_element_float(26::bigint, a.sp_price::numeric(10,2))) AS "sp_price",';
		sql := sql || ' (SELECT * FROM rtn_element_integer(21::bigint, a.quantity::integer)) AS "quantity",';
		sql := sql || ' ( SELECT COUNT (b.*) FROM matview_products b WHERE (b.location_id = ';
		sql := sql || _location || ') ) AS "totalRecords"';
		sql := sql || ' FROM matview_products a WHERE a.manufacturer_id = ' || _establishment;
		sql := sql || ' AND a.location_id =' || _location;
			IF _filter IS NOT NULL THEN
			sql := sql || _filter;
			END IF;
		sql := sql || ' OFFSET ' || _offset || ' LIMIT ' || _limit || ') t1) t';

		RETURN QUERY EXECUTE sql;
	END;

$function$;

SELECT * FROM rtn_products_filter('10', '0', '362', '1', ' AND a.products ILIKE ''%hef%'' ');