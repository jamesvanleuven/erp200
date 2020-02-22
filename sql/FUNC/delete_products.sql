-- DELETE FROM pim_inventory WHERE manufacturer_id = 362;
/*
DELETE FROM pim_batch aa
WHERE (aa.product_id IN
	(
		SELECT a.product_id
		FROM pim_batch AS a 
		LEFT JOIN pim_products AS b ON b.id = a.product_id 
		WHERE b.manufacturer_id = 362
	)
);
*/

-- DELETE FROM pim_inventory WHERE manufacturer_id = 362;

-- REFRESH MATERIALIZED VIEW matview_products;