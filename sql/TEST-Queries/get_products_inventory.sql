/*
WITH ins_a AS (
	INSERT INTO pim_inventory (
		batch_id,
		location_id,
		manufacturer_id,
		quantity
	)
	SELECT 
		b.id,
		'4',
		a.manufacturer_id,
		'25'
	FROM pim_products a
	right outer join pim_batch b on b.product_id = a.id
)
*/

SELECT
	c.id,
	a.id AS product_id,
	b.id AS batch_id,
	a.manufacturer_id,
	c.location_id,
	d.name AS "location",
	b.name AS "product",
	a.agent_number,
	a.sku,
	b.extended_sku,
	b.upc,
	b.user_reference,
	b.litres_per_bottle,
	b.bottles_per_skid,
	b.bottles_per_case,
	b.alcohol_percentage,
	b.litter_rate,
	b.mfr_price,
	b.rtl_price,
	b.sp_price,
	b.promo,
	b.created,
	b.active,
	c.quantity AS "sub_total",
	(
		SELECT SUM(f.quantity) 
		FROM pim_inventory f 
		RIGHT OUTER JOIN pim_batch g on g.id = f.batch_id 
		WHERE f.batch_id = b.id
	) AS "total"
FROM pim_products a 
RIGHT OUTER JOIN pim_batch b ON b.product_id = a.id 
RIGHT OUTER JOIN pim_inventory c ON c.batch_id = b.id 
RIGHT OUTER JOIN crm_locations d ON d.id = c.location_id
RIGHT OUTER JOIN crm_establishments e ON e.id = d.establishment_id 
WHERE a.id IS NOT NULL -- AND c.location_id = '4'
GROUP BY 1,2,3,6
ORDER BY c.location_id, a.id;