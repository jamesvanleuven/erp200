-- REFRESH MATERIALIZED VIEW matview_transfers;

SELECT DISTINCT ON(a.transfer_id)
	a.transfer_id AS "Transfer Id"
    , a.product_id AS "Product Id"
    , a.product AS "Product"
    , a.sku AS "SKU"
    , COALESCE(p.total, 0) AS "Production In"
	, COALESCE(t.total, 0) AS "Transfer In"
    , COALESCE(w.total, 0) AS "Transfers Out"
    , COALESCE(m.total, 0) as "Manual Adjustments"
    , COALESCE(o.total, 0) as "Orders"
    , COALESCE(a.inventory::integer, 0) AS "Inventory (un-allocated)" 
    , a.created
FROM matview_report_transfers a 

-- PRODUCTION IN
LEFT JOIN (
	SELECT DISTINCT
		a.product_id
		, COALESCE(SUM(a.quantity), 0) AS total
	FROM matview_report_transfers a 
	WHERE (
		(a.status_id = 7) AND
		(a.type_id IN(2)) AND
		(a.warehouse_id = 1) 
	)
	GROUP BY 1 ORDER BY 1
) p ON p.product_id = a.product_id 


-- WAREHOUSE IN
LEFT JOIN (
	SELECT DISTINCT
		a.product_id
		, COALESCE(SUM(a.quantity), 0) AS total
	FROM matview_report_transfers a 
	WHERE (
		(a.status_id = 7) AND
		(a.type_id IN(1)) AND
		(a.receiving_id = 1) 
	)
	GROUP BY 1 ORDER BY 1
) t ON t.product_id = a.product_id 

-- WAREHOUSE OUT
LEFT JOIN (
	SELECT 
		a.product_id
		, COALESCE(SUM(a.quantity), 0) AS total
	FROM matview_report_transfers a WHERE (
		(a.type_id = 1) AND
		(a.shipping_id = 1) 
	)
	GROUP BY 1 ORDER BY 1 
) w ON w.product_id = a.product_id

-- MANUAL ADJUSTMENTS
LEFT JOIN (
	SELECT 
		a.product_id
		, COALESCE(SUM(a.quantity), 0) AS total
	FROM matview_report_transfers a WHERE (
		(a.type_id = 3) AND
		(a.warehouse_id = 1) 
	)
	GROUP BY 1 ORDER BY 1
) m
ON m.product_id = a.product_id 

-- ORDERS
LEFT JOIN (
	SELECT 
		a.product_id,  
		COALESCE(SUM(a.quantity), 0) AS total 
	FROM 
	    matview_report_orders a WHERE (
	    (a.warehouse_id = 1) 
	)
	GROUP BY 1 ORDER BY 1 
) o ON o.product_id = a.product_id 
WHERE (
	a.warehouse_id IN(1,2,3,4) 
	AND 
	manufacturer_id IN(377)
	AND
	EXTRACT(MONTH FROM a.created) = 	EXTRACT(MONTH FROM NOW())
) 
ORDER BY 1;