DROP FUNCTION IF EXISTS public.cs_select_products(
	_location bigint
	, _manufacturer bigint
	, _param character varying 
);

CREATE OR REPLACE FUNCTION public.cs_select_products(
	_location bigint
	, _manufacturer bigint
	, _param character varying
) RETURNS TABLE (
	result json
) LANGUAGE plpgsql 
AS $function$ 

DECLARE 
	_location ALIAS FOR $1;
	_manufacturer ALIAS FOR $2;
	_param ALIAS FOR $3;
	sql character varying;
	
BEGIN

	sql := 'SELECT array_to_json(array_agg(row_to_json(t))) FROM ('
		|| 'SELECT DISTINCT ON(a.id)'
		|| ' a.id'
		
		-- PRODUCT
		|| ', (SELECT row_to_json(p) FROM ('
		|| 'SELECT a.product_id AS id, INITCAP(a.product) AS value) p) AS selected'
		
		-- MANUFACTURER
		|| ', (SELECT row_to_json(m) FROM ('
		|| 'SELECT a.manufacturer_id AS id, INITCAP(a.manufacturers) AS value) m'
		|| ') AS manufacturer'
		
		-- LOCATION
		|| ', (SELECT row_to_json(l) FROM ('
		|| 'SELECT a.location_id AS id, INITCAP(a.locations) AS value ) l'
		|| ') AS location'
		
		-- PRODUCT TYPE
		|| ', (SELECT row_to_json(pro) FROM ('
		|| 'SELECT b.id, b.name AS value ) pro'
		|| ') AS product_type'
		
		-- PACKAGE TYPE
		|| ', (SELECT row_to_json(pac) FROM ('
		|| 'SELECT c.id, c.name AS value) pac'
		|| ') AS package_type'
		
		-- COLUMNS
		|| ', a.sku, a.litres_per_bottle AS volume, a.quantity AS inventory'
		
		|| ' FROM matview_products AS a '
		|| ' LEFT OUTER JOIN pim_product_types b ON b.id = a.product_type_id'
		|| ' LEFT OUTER JOIN pim_package_type c ON c.id = a.package_type_id'
		|| ' WHERE ((a.active = true)';
		
	IF _location != 0 THEN
		sql := sql || ' AND (a.location_id IN(SELECT(UNNEST(ARRAY['
			|| _location
			|| ']))))';
	ELSE
		sql := sql || ' AND (a.location_id NOT IN(SELECT(UNNEST(ARRAY['
			|| _location
			|| ']))))';
	END IF;
	
	IF _manufacturer != 0 THEN
		sql := sql || ' AND (a.manufacturer_id IN(SELECT(UNNEST(ARRAY['
			|| _manufacturer
			|| ']))))';
	ELSE
		sql := sql || ' AND (a.manufacturer_id NOT IN(SELECT(UNNEST(ARRAY['
			|| _manufacturer
			|| ']))))';
	END IF;
	
	IF _param IS NOT NULL THEN
		sql := sql || ' AND (a.product ILIKE ''%'
			|| _param
			|| '%'' OR a.sku::text ILIKE ''%'
			|| _param
			|| '%'')';
	END IF;
	
	sql := sql || ') ORDER BY a.id, a.product) t;';

	RETURN QUERY EXECUTE sql;

END;

$function$;

SELECT * FROM public.cs_select_products(0::bigint, 0::bigint, '1'::character varying);