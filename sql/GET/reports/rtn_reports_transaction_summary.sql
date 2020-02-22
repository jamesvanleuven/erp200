SELECT 
    transfers.product_id, 
    INITCAP(
        LOWER(transfers.product)
    ) AS product, 
    transfers.sku, 
    transfers.ordered as "Total Transfer In", 
    COALESCE(w2w."Transfers Out", 0) AS "Total Transfers Out", 
    COALESCE(adjustments.ordered, 0) as "Manual adjustments", 
    COALESCE(orders.ordered, 0) as "Orders", 
    COALESCE(inventory."un_allocated", 0) AS "Inventory (un-allocated)" 
FROM 
    (
    
/* ----------------------------------- */
		SELECT 
		    a.id AS "transfer_id",
		    (p.value ->> 'id')::bigint AS product_id,
		    b.product,
		    b.sku,
		    (
		        SUM(
		            (
		                (p.value ->> 'quantity')::integer
		            )
		        )
		    ) AS "ordered",
		    a.manufacturer_id,
		    a.manufacturer,
		    a.type_id,
		    a.transfer_type AS type,
		    a.from_id AS "shipping_id",
		    COALESCE(a.from_warehouse, 'HWH') AS "shipping_warehouse",
		    a.to_id AS "receiving_id",
		    a.to_warehouse AS "receiving_warehouse"
		FROM 
		    matview_transfers a, 
		    (
		        LATERAL json_array_elements(a.products) p(value) 
		        LEFT JOIN matview_products b ON (
		        	b.product_id = (
		                (p.value ->> 'id'::text)
		            )::bigint
		        )
		    ) 
		WHERE (
			(a.status_id = 7) AND
			(a.type_id IN(1,2,3)) AND -- W2W & PRODUCTION
			a.to_id = 1 
		)
		GROUP BY (1,2,3,4,6,7,8,9,10,11,12,13)
		ORDER BY 2 Desc
/* ----------------------------------- */
		
    ) transfers 
    LEFT JOIN (
    
/* ----------------------------------- */
		SELECT 
			(p.value ->> 'id')::bigint AS product_id, 
			b.product, 
			COALESCE(SUM(
			    ((p.value->> 'quantity'::text)::integer)
			), 0) AS ordered 
		FROM 
		    matview_orders a, 
		    (
		        LATERAL json_array_elements(a.products) p(value) 
		        LEFT JOIN matview_products b ON (
		        	b.product_id = ((p.value->> 'id'::text)::bigint)
		        )
		    ) 
		WHERE (
		    (a.status_id NOT IN(4)) 
		    and (a.location_id = 1) 
		)
		GROUP BY (1,2)
		ORDER BY 1 Asc
/* ----------------------------------- */

    ) orders 
    ON orders.product_id = transfers.product_id 
    LEFT JOIN (

/* ----------------------------------- */
		SELECT 
		    a.manufacturers, 
		    a.product, 
		    a.sku,
		    a.product_id, 
		    COALESCE(SUM(
		        a.quantity::integer
		    ), 0) AS "un_allocated" 
		FROM 
			matview_products a
		WHERE 
		    a.location_id = 1
		GROUP BY (1,2,3,4)
		ORDER BY 1,4
/* ----------------------------------- */

    ) inventory 
    ON inventory.product_id = transfers.product_id 
    LEFT JOIN (
    
/* ----------------------------------- */
		SELECT 

			(p.value ->> 'id')::bigint AS product_id, 
		    b.product, 
		    SUM(
		        (p.value ->> 'quantity')::integer
		    ) AS ordered 
		FROM 
		    matview_transfers a, 
		    (
		        LATERAL json_array_elements(a.products) p(value) 
		        LEFT JOIN matview_products b ON (
		        	b.product_id = ((p.value->> 'id'::text)::bigint)
		        )
		    ) 
		WHERE (
			a.type_id = 3 AND 
			a.to_id = 1
		)
		GROUP BY (1,2)
		ORDER BY 1
/* ----------------------------------- */

    ) adjustments 
    ON adjustments.product_id = transfers.product_id 
    LEFT JOIN (
    
/* ----------------------------------- */
        SELECT 
            (p.value ->> 'id')::bigint AS product_id, 
            b.product, 
            (
            	COALESCE(
            		SUM(
            			(p.value ->> 'quantity'::text)::integer
            		), 0
            	)
            ) AS "Transfers Out" 
        FROM 
		    matview_transfers a, 
		    (
		        LATERAL json_array_elements(a.products) p(value) 
		        LEFT JOIN matview_products b ON (
		        	b.product_id = ((p.value->> 'id'::text)::bigint)
		        )
		    ) 
        WHERE (
            (status_id NOT IN (4)) AND
            (a.type_id = 1) AND
            (a.from_id = 1)
        )
        GROUP BY (1,2)
        ORDER BY 1
/* ----------------------------------- */

    ) w2w 
    ON w2w.product_id = transfers.product_id;