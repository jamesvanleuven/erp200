CREATE OR REPLACE VIEW view_products AS
 SELECT 
	a.id AS product_id,
	b.name AS products,
	c.id AS inventory_id,
	e.id AS manufacturer_id,
	e.manufacturers,
	c.location_id,
	d.name AS locations,
	a.sku,
	b.batch_id,
	b.batch_name,
	b.upc,
	b.category_1 AS product_type_id,
	j.name AS product_type,
	b.category_2 AS package_type_id,
	h.name AS package_type,
	b.litres_per_bottle,
	b.bottles_per_skid,
	b.bottles_per_case,
	b.alcohol_percentage,
	b.litter_rate,
	b.mfr_price,
	b.rtl_price,
	b.ws_price,
	b.created,
	b.active,
	c.quantity,
    (
		SELECT sum(f.quantity) AS sum 
		FROM pim_inventory f 
		RIGHT OUTER JOIN pim_batch g ON g.id = f.batch_id
	    WHERE f.batch_id = c.batch_id
	) AS total_quantity
	FROM pim_products a
		RIGHT JOIN pim_batch b ON b.product_id = a.id
		RIGHT JOIN pim_inventory c ON c.batch_id = b.id
		RIGHT JOIN crm_locations d ON d.id = c.location_id
		RIGHT JOIN matview_manufacturers e ON e.id = c.manufacturer_id
		LEFT OUTER JOIN pim_product_types j ON j.id = b.category_1 
		LEFT OUTER JOIN pim_package_type h ON h.id = b.category_2
  WHERE a.id IS NOT NULL;