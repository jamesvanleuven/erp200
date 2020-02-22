CREATE OR REPLACE FUNCTION public.rtn_sku(
	_manufacturer_id bigint, 
	_sku bigint
) RETURNS TABLE (
	id bigint,
	manufacturer_id bigint,
	sku bigint,
	active boolean,
	totalItems bigint
) 
LANGUAGE sql 
AS $function$


		SELECT 
			a.id,
			a.manufacturer_id,
			a.sku,
			a.active,
			(
				SELECT 
					count(b.*) 
				FROM pim_batch b 
				WHERE b.sku = _sku
			) AS totalItems
		FROM pim_products a 
		LEFT OUTER JOIN pim_batch b ON b.product_id = a.id 
		WHERE 
			a.manufacturer_id = _manufacturer_id 
			AND a.sku = _sku 
		ORDER BY a.id Desc;

$function$;

SELECT * FROM public.rtn_sku('362'::bigint, '669606'::bigint);