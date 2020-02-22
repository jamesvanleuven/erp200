-- DELETE DUPLICATES ON INVENTORY TABLE
DELETE FROM pim_inventory
WHERE id IN (SELECT id
FROM (
	SELECT 
		id,
		ROW_NUMBER() OVER (
			partition BY 
				id 
			ORDER BY id
		) AS rnum
	FROM pim_inventory
) t
WHERE t.rnum > 1);

-- DELETE DUPLICATES ON PRODUCTS TABLE
DELETE FROM pim_products
WHERE id IN (SELECT id
FROM (
	SELECT 
		id,
		ROW_NUMBER() OVER (
			partition BY 
				id 
			ORDER BY id
		) AS rnum
	FROM pim_products
) t
WHERE t.rnum > 1);

-- DELETE DUPLICATES ON BATCH TABLE
DELETE FROM pim_batch
WHERE id IN (SELECT id
FROM (
	SELECT 
		id,
		ROW_NUMBER() OVER (
			partition BY 
				id 
			ORDER BY id
		) AS rnum
	FROM pim_batch
) t
WHERE t.rnum > 1);

-- DELETE DUPLICATES ON TRANSFERS TABLE
DELETE FROM pim_transfers
WHERE id IN (SELECT id
FROM (
	SELECT 
		id,
		ROW_NUMBER() OVER (
			partition BY 
				id 
			ORDER BY id
		) AS rnum
	FROM pim_transfers
) t
WHERE t.rnum > 1);

-- DELETE DUPLICATES ON ORDERS TABLE
DELETE FROM pim_orders
WHERE id IN (SELECT id
FROM (
	SELECT 
		id,
		ROW_NUMBER() OVER (
			partition BY 
				id 
			ORDER BY id
		) AS rnum
	FROM pim_orders
) t
WHERE t.rnum > 1);


-- RETURN DUPLICATE ESTABLISHMENTS
SELECT 
--	duplicateRecords 
--	, a.id
	a.id
	, a.license_number 
	, a.name AS establishment
	, a.store_number
	, a.establishment_type_id
	, c.name AS establishment_type
	, a.license_type_id
	, d.name AS license_type
	, a.customer_type_id
	, e.name AS license_sub_type
FROM crm_establishments a INNER JOIN
     ( SELECT b.license_number, COUNT(b.license_number) AS duplicateRecords
        FROM crm_establishments b
        GROUP BY  b.license_number
        HAVING ( COUNT(b.license_number) > 1 ) ) AS duplicates
ON a.license_number = duplicates.license_number 
LEFT OUTER JOIN crm_establishment_types c ON c.id = a.establishment_type_id
LEFT OUTER JOIN crm_license_types d ON d.id = a.license_type_id
LEFT OUTER JOIN crm_license_sub_types e ON e.id = a.license_sub_type_id;

-- RETURN DUPLICATE PRODUCTS, BATCH-ITEMS, INVENTORY
SELECT 
	duplicateRecords 
	, a.sku
	, a.id AS product_id
	, c.id AS batch_id
	, e.id AS inventory_id
	, a.manufacturer_id
	, d.name AS manufacturer
	, e.location_id
	, f.name AS location
	, c.name AS "name_in_batch"
	, e.quantity
	, e.on_hold
FROM pim_products a INNER JOIN
     ( SELECT b.sku, COUNT(b.sku) AS duplicateRecords
        FROM pim_products b
        GROUP BY  b.sku
        HAVING ( COUNT(b.sku) > 1 ) ) AS duplicates
ON a.sku = duplicates.sku
LEFT OUTER JOIN pim_batch c ON c.product_id = a.id
LEFT OUTER JOIN pim_inventory e ON (e.product_id = a.id AND e.batch_id = c.id)
LEFT OUTER JOIN crm_establishments d ON d.id = a.manufacturer_id
LEFT OUTER JOIN crm_locations f ON f.id = e.location_id 
ORDER BY a.sku, a.manufacturer_id, e.location_id;