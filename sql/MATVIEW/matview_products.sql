DROP MATERIALIZED VIEW IF EXISTS matview_products CASCADE;
DROP INDEX IF EXISTS "matview_products_id_seq";

CREATE MATERIALIZED VIEW matview_products
AS 
  
SELECT
	b.id,
	a.id AS product_id,
	initcap(lower((b.name)::character varying)) AS product,
	c.id AS inventory_id,
	e.id AS manufacturer_id,
	initcap(lower(e.manufacturers::character varying)) AS manufacturers,
	c.location_id,
	initcap(lower((d.name)::character varying)) AS locations,
	a.sku,
	b.batch_id,
	b.batch_name,
	b.category_1 AS product_type_id,
	f.name AS product_type,
	b.category_2 AS package_type_id,
	h.name AS package_type,
	b.upc,
	b.litres_per_bottle,
	b.bottles_per_skid,
	b.bottles_per_case,
	b.alcohol_percentage,
	b.litter_rate,
	b.mfr_price,
	b.rtl_price,
	b.ws_price,
	b.notes,
	b.created,
	b.active,
	c.quantity,
	(
		SELECT 
			COALESCE(SUM(aa.quantity), 0) AS sum
		FROM pim_inventory aa
		LEFT JOIN pim_batch bb ON (bb.id = aa.batch_id)
		WHERE (
			(aa.batch_id = b.id)
		)
	) AS total_quantity
FROM pim_products a 
	LEFT JOIN pim_batch b ON (b.product_id = a.id)
	LEFT JOIN pim_inventory c ON (c.product_id = a.id AND c.batch_id = b.id)
	LEFT JOIN crm_locations d ON (d.id = c.location_id)
	LEFT JOIN matview_manufacturers e ON (e.id = c.manufacturer_id)
	LEFT JOIN pim_product_types f ON (f.id = b.category_1)
	LEFT JOIN pim_package_type h ON (h.id = b.category_2)
ORDER BY a.id Desc;

CREATE UNIQUE INDEX "matview_products_id_seq" ON matview_products(inventory_id);
REFRESH MATERIALIZED VIEW public.matview_products;

SELECT * FROM matview_products ORDER BY product_id;