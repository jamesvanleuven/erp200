-- SELECT * FROM pim_transfers WHERE id = '157';
SELECT * FROM pim_transfers ORDER BY id Desc;

SELECT DISTINCT
	a.id AS transfer_id,
	a.type_id AS transfer_type_id,
	(
		SELECT 
			dd.name 
		FROM 
			pim_transfer_types dd 
		WHERE dd.id = a.type_id
	) AS transfer_type,
	(p->>'id')::bigint AS product_id,
	c.name AS product,
	c.sku,
	a.manufacturer_id, 
	e.manufacturers AS manufacturer, 
	a.from_id,
	(
		SELECT 
			aa.name 
		FROM matview_locations aa 
		WHERE 
			(
				CASE 
					WHEN a.from_id = 0 THEN	
						aa.establishment_id = a.manufacturer_id 
					ELSE 
						aa.id = a.from_id
					END
			)
	) AS from_warehouse,
	a.to_id,
	(
		SELECT 
			bb.name 
		FROM matview_locations bb 
		WHERE bb.id = a.to_id
	) AS to_warehouse,
	(p->>'quantity')::integer AS quantity,
	(p->>'price')::decimal(10,2) AS price,
	c.mfr_price,
	c.rtl_price,
	c.ws_price,
	b.quantity AS inventory,
	b.on_hold,
	a.status_id,
	(
		SELECT 
			cc.name 
		FROM pim_statuses cc 
		WHERE cc.id = a.status_id
	) AS status,
	a.user_id AS creator_id,
	(
		SELECT 
			ff.firstname || ' ' || ff.lastname 
		FROM crm_users ff 
		WHERE ff.id = a.user_id
	) AS created_by,
	a.created,
	a.delivery_date
FROM pim_transfers a, json_array_elements(a.products) p
LEFT OUTER JOIN pim_inventory b ON b.product_id = (p->>'id')::bigint 
LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>'id')::bigint 
LEFT OUTER JOIN pim_products d ON d.id = (p->>'id')::bigint 
LEFT OUTER JOIN matview_manufacturers e ON e.id = d.manufacturer_id 
-------------------------------------------------------------------
-- BECAUSE WE'RE USING A JSON COLUMN KEY/VALUE QUERY WE HAVE TO 
-- USE NESTED QUERIES. THE JSON_ARRAY_ELEMENTS(KEY) PREVENTS JOINS
-- ON THE TRANSFER TABLE ITSELF
-------------------------------------------------------------------
-- QUERIES BY FROM/TO WAREHOUSE ID SHOULD BE DEALT WITH IN AN ARRAY
-- AND QUERIED ON PIM_INVENTORY.LOCATION_ID NOT THE TO_ID/FROM_ID 
-- OR BY THE a.MANUFACTURER_ID IF DEALING WITH PRODUCTION RETURNS
-- AS THE FROM_ID PRODUCTION LOCATION IS LISTED AS '0' AND WILL
-- RETURN DUPLICATES. THIS IS UNPRVENTABLE
-------------------------------------------------------------------
-- QUERY BY AN ARRAY OF ORDER ID'S
WHERE a.id IN(SELECT(UNNEST(ARRAY[158,157,156]))) AND b.location_id = '1'
-------------------------------------------------------------------
-- QUERY BY A MANUFACTURER_ID, LOCATION_ID
-- WHERE a.manufacturer_id = '9924' AND b.location_id = '1'
-------------------------------------------------------------------
ORDER BY a.id;