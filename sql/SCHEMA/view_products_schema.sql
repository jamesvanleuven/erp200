DROP VIEW view_products_schema;
CREATE VIEW view_products_schema AS
SELECT
	a.id
	, c.column_name
	, c.alias
	, c.view_name
	, c.data_type
	, a.product_id
	, b.manufacturer_id
	, b.agent_number
	, d.location_id
	, a.name AS "product"
	, a.batch_id
	, a.batch_name
	, a.sku
	, a.upc
	, a.litres_per_bottle
	, a.bottles_per_skid
	, a.bottles_per_case
	, a.alcohol_percentage
	, a.litter_rate
	, a.mfr_price
	, a.rtl_price
	, a.ws_price
	, a.category_1 AS "product_type"
	, a.category_2 AS "package_type"
FROM pim_batch a
LEFT OUTER JOIN pim_products b ON b.id = a.product_id AND a.sku = b.sku
LEFT OUTER JOIN cms_elements c ON c.table_name = 'pim_batch' 
LEFT OUTER JOIN pim_inventory d ON d.product_id = a.product_id AND d.batch_id = a.id 
WHERE b.manufacturer_id = 0 AND d.location_id = 0
order by c.ordinal;