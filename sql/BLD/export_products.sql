SELECT
	-- COALESCE(REGEXP_REPLACE(initcap(a.supplier::text), '[^\w\s]','','g'), NULL) AS "manufacturer",
	TRIM(COALESCE(REGEXP_REPLACE(REPLACE(initcap(a.brand_name::text), 'Big Rock', ''), '[^\w\s]','','g'), NULL)) AS "product",
	-- COALESCE(SUBSTRING(a.supplier_num::text FROM '[0-9]+'), '0')::bigint AS "supplier_num",
	-- a.sku AS "original_sku",
	COALESCE(SUBSTRING(a.sku::text FROM '^\d+'),'0')::integer AS "sku",
	COALESCE(SUBSTRING(UPPER(a.sku::text) FROM '[a-zA-Z][a-zA-Z0-9]*$'), NULL) AS "batch_id",
	-- COALESCE(SPLIT_PART(SUBSTRING(a.sku::text FROM '[0-9]+'),'[^a-zA-Z]',1), '0')::integer AS "sku",
	-- COALESCE(REGEXP_REPLACE(UPPER(a.sku::text), '[^a-zA-Z]+','','g'), NULL) AS "batch_id",
	NULL AS "batch_name",
	COALESCE(SUBSTRING(a.upc::text FROM '[0-9]+'), '0')::bigint AS "upc",
	COALESCE((SPLIT_PART(SUBSTRING(a.ltr_btl::text FROM '[0-9]+'),'.',1)::float/100), '0.00')::numeric(10,2) AS "litres_per_bottle",
	COALESCE(a.btl_su::text, '0')::integer AS "bottles_per_skid",
	COALESCE(a.btl_cs::text, '0')::integer AS "bottles_per_case",
	(COALESCE(SUBSTRING(a.pct_alc::text FROM '[0-9]+'), '0.00')::float/100)::numeric(10,2) AS "alcohol_percentage",
	(COALESCE(SUBSTRING(a.litter_rate::text FROM '[0-9]+'), '0.00')::float/100)::numeric(10,2) AS "litter_rate",
	(COALESCE(SUBSTRING(a.mfr_price::text FROM '[0-9]+'), '0.00')::float/100)::numeric(10,2) AS "mfr_price",
	(COALESCE(SUBSTRING(a.retail_price::text FROM '[0-9]+'), '0.00')::float/100)::numeric(10,2) AS "rtl_price",
	('0.00'::float)::numeric(10,2) AS "sp_price",
	('0.00'::float)::numeric(10,2) AS "ws_price",
	COALESCE(SUBSTRING(initcap(a.category_1::text) FROM '[a-zA-Z]*$'), NULL) AS "category_1",
	COALESCE(SUBSTRING(initcap(a.category_2::text) FROM '[a-zA-Z]*$'), NULL) AS "category_2",
	a.disabled AS "active"
FROM catalogue a
WHERE (
	a.supplier ILIKE '%Big Rock%' 
) 
ORDER BY a.sku, "product" Asc;