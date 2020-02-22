DROP FUNCTION IF EXISTS public.rtn_orders(
	_limit integer
	, _offset integer
	, _establishment integer
	, _location integer
	, _filter character varying
);

CREATE OR REPLACE FUNCTION public.rtn_orders(
	_limit integer
	, _offset integer
	, _establishment integer
	, _location integer
	, _filter character varying
)
 RETURNS TABLE(orders json)
 LANGUAGE plpgsql
AS $function$ 
 
BEGIN

PERFORM rtn_orders_view(
		_limit, 
		_offset, 
		_establishment, 
		_location, 
		_filter
);

RETURN QUERY (

	SELECT array_to_json(array_agg(row_to_json(t))) 
	FROM (
	
		SELECT row_to_json(tt) 
		FROM (
		
			SELECT 
				id,
				(SELECT * FROM rtn_element_bigint('34'::bigint, order_number::bigint)) AS "order_id", 
				(SELECT * FROM rtn_element_text('35'::bigint, order_reference::text)) AS "order_reference",
				(SELECT * FROM rtn_element_bigint('83'::bigint, license_number::bigint)) AS "license_number",
				(SELECT * FROM rtn_element_cs('37'::bigint, customer::text, customer_id::bigint)) AS "customer",
				(SELECT * FROM rtn_customers_list(ARRAY[customer_id]::integer[])) AS "customer_info",
				(SELECT * FROM rtn_element_text('73'::bigint, address::text)) AS "address",
				(SELECT * FROM rtn_element_cs('74'::bigint, city::text, city_id::bigint)) AS "city",
				(SELECT * FROM rtn_element_cs('38'::bigint, manufacturer::text, manufacturer_id::bigint)) AS "manufacturer",
				(SELECT * FROM rtn_manufacturers_list(ARRAY[manufacturer_id]::integer[])) AS "manufacturer_info",
				(SELECT * FROM rtn_element_select('39'::bigint, location::text, location_id::bigint)) AS "location",
				(SELECT * FROM rtn_element_json('46'::bigint, products::json)) AS "products",
				(SELECT * FROM rtn_element_select('36'::bigint, created_by::text, user_id::bigint)) AS "created_by",
				(SELECT * FROM rtn_element_text('45'::bigint, create_date::text)) AS "created_date",
				(SELECT * FROM rtn_element_text('44'::bigint, deliver_date::text)) AS "deliver_date",
				(SELECT * FROM rtn_element_boolean('41'::bigint,rush::boolean)) AS "rush",
				(SELECT * FROM rtn_element_boolean('42'::bigint,pickup::boolean)) AS "pickup",
				(SELECT * FROM rtn_element_boolean('40'::bigint,paid::boolean)) AS "paid",
				(SELECT * FROM rtn_element_boolean('82'::bigint,promo::boolean)) AS "promo",
				(SELECT * FROM rtn_element_select('43'::bigint, status::text, status_id::bigint)) AS "status",
				(SELECT * FROM rtn_element_json('48'::bigint, notes::json)) AS "notes",
				(SELECT * FROM rtn_products_list(manufacturer_id::integer, location_id::integer)) AS "productList"
			FROM rtn_orders_view(
				_limit, 
				_offset, 
				_establishment, 
				_location, 
				_filter
			)
			ORDER BY create_date Desc
		
		) tt
	
	) t
	
);

END;

$function$;



SELECT * FROM rtn_orders(25, 0, 0, 1, NULL);

