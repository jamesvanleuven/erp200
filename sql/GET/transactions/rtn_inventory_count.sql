CREATE OR REPLACE FUNCTION public.rtn_inventory_count(
	_manufacturer integer, 
	_location integer, 
	_product integer, 
	_quantity integer
) RETURNS json 
LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(t))) 
	FROM (
		SELECT 
			a.id,
			a.product_id,
			a.manufacturer_id,
			a.location_id,
			a.quantity
		FROM pim_inventory a  
		WHERE 
			a.manufacturer_id = _manufacturer
			AND a.location_id = _location 
			AND a.product_id = _product
			AND a.quantity >= _quantity 
			AND a.active = true
	) t

$function$;

SELECT * FROM rtn_inventory_count(442, 1, 74, 25);