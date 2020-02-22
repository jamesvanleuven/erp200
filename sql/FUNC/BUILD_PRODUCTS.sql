CREATE OR REPLACE FUNCTION public.rtn_products(
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
    sql := sql || ' (SELECT * FROM rtn_element_text(32::bigint, a.batch_id::text)) AS "batch_number",';
    sql := sql || ' (SELECT * FROM rtn_element_text(33::bigint, a.batch_name::text)) AS "batch_name",';
    sql := sql || ' (SELECT * FROM rtn_element_bigint(15::bigint, a.sku::bigint)) AS "sku",';
    sql := sql || ' (SELECT * FROM rtn_element_bigint(16::bigint, a.upc::bigint)) AS "upc",';
    sql := sql || ' (SELECT * FROM rtn_element_float(17::bigint, a.litres_per_bottle::numeric(10,4))) AS "litres_per_bottle",';
    sql := sql || ' (SELECT * FROM rtn_element_integer(23::bigint, a.bottles_per_case::integer)) AS "bottles_per_case",';
    sql := sql || ' (SELECT * FROM rtn_element_integer(18::bigint, a.bottles_per_skid::integer)) AS "bottles_per_skid",';

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

CREATE OR REPLACE FUNCTION public.rtn_products_assets(_manufacturers integer[])
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "products"
			FROM (
				SELECT 
					( SELECT * FROM rtn_manufacturer_types(_manufacturers::integer[]) ) AS "manufacturer_types"
			) a3
	) a2;

$function$;

CREATE OR REPLACE FUNCTION public.rtn_products_all(
	_limit integer, 
	_offset integer, 
	_establishment integer, 
	_manufacturers integer[], 
	_locations integer[], 
	_location integer, 
	_group integer, 
	_role integer, 
	_filter character varying
) RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) AS "results"
	FROM (
			SELECT row_to_json(a3) AS "products"
			FROM (
				SELECT 
					(SELECT * FROM rtn_products(_limit, _offset, _establishment, _location, _filter)) AS "items",
					(SELECT * FROM rtn_products_assets(Array[_manufacturers]::integer[])) AS "assets"
					
			) a3
	) a2;

$function$;