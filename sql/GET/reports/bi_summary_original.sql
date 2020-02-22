	SELECT array_to_json(array_agg(row_to_json(t))) 
	FROM (SELECT 
			a.manufacturer_id,
			(SELECT INITCAP(aa.manufacturers) AS manufacturer 
			FROM matview_manufacturers aa WHERE (aa.id = a.manufacturer_id)) AS manufacturer,
			a.location_id,
			(SELECT aa.name FROM matview_locations aa WHERE aa.id = a.location_id) AS location,
		    a.product_id,
		    INITCAP(a.product) AS products,
		    a.sku,
		    COALESCE(a.ordered::INTEGER, 0) as transfers_in,
		    COALESCE(t.transfers_out::INTEGER, 0) AS transfers_out,
		    COALESCE(m.ordered::INTEGER, 0) as manual_adjustments,
		    COALESCE(o.ordered::INTEGER, 0) as orders,
		    i.not_allocated
		FROM (
		    SELECT DISTINCT ON((p->>'id')::bigint)
			   a.manufacturer_id,
			   a.location_id,
			   (p->>'id')::bigint AS product_id,
			   c.sku,
			   c.name AS product,
			   a.created,
			   sum((p->>'quantity')::integer) AS ordered
		    FROM pim_orders a, json_array_elements(a.products) p
		        LEFT OUTER JOIN pim_products b ON b.id = (p->>'id')::bigint 
		        LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>'id')::bigint 
		    WHERE (
		    	(p->>'id')::bigint > 0
		        AND status_id IN(1,2,3) 
		        AND a.location_id NOT IN(SELECT(UNNEST(ARRAY[0]))) 
		    )
		    GROUP BY 1, 2, 3, 4, 5, 6
		    ORDER BY 3
		) a
		
		LEFT OUTER JOIN (
		    SELECT DISTINCT ON((p->>'id')::bigint)
			   (p->>'id')::bigint AS product_id,
			   a.manufacturer_id,
			   a.location_id,
			   c.name AS product,
			   sum((p->>'quantity')::integer) AS ordered
		    FROM pim_orders a, json_array_elements(a.products) p
		        LEFT OUTER JOIN pim_products b ON b.id = (p->>'id')::bigint 
		        LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>'id')::bigint 
		    WHERE (
		    	(p->>'id')::bigint > 0
		        AND status_id NOT IN(SELECT(UNNEST(ARRAY[4]))) 
		        AND a.location_id NOT IN(SELECT(UNNEST(ARRAY[0]))) 
		    )
		    GROUP BY 1, 2, 3, 4
		    ORDER BY 1
		) o on a.product_id = o.product_id
		
		LEFT JOIN (
		    SELECT
		        cc."name",
		        bb."name",
		        bb.product_id,
		        sum(aa.quantity) AS not_allocated
		    FROM "public".pim_inventory aa
		        INNER JOIN "public".pim_batch bb ON aa.product_id = bb.product_id
		        INNER JOIN "public".crm_establishments cc ON cc.id = aa.manufacturer_id
		--        INNER JOIN "public".crm_establishments cc ON cc."id" = aa.manufacturer_id
		    WHERE (
		    	aa.location_id NOT IN(SELECT(UNNEST(ARRAY[0])))
		    ) 
		    GROUP BY 1, 2, 3
		) i on a.product_id = i.product_id
		
		LEFT JOIN (
		    SELECT DISTINCT
			   (p->>'id')::bigint AS product_id,
			   c.name AS product,
			   sum((p->>'quantity')::integer) AS ordered
		    FROM pim_transfers a, json_array_elements(a.products) p
		        LEFT OUTER JOIN pim_products b ON b.id = (p->>'id')::bigint 
		        LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>'id')::bigint 
		    WHERE (
		    	type_id = 3 
		    	AND a.to_id NOT IN(SELECT(UNNEST(ARRAY[0])))
		    )
		    GROUP BY 1, 2
		    ORDER BY 1
		) m on a.product_id = m.product_id
		
		LEFT JOIN (
		    SELECT DISTINCT
			   (p->>'id')::bigint AS product_id,
			   c.name AS product,
			   sum((p->>'quantity')::integer) AS transfers_out
		    FROM pim_transfers a, json_array_elements(a.products) p
		        LEFT OUTER JOIN pim_products b ON b.id = (p->>'id')::bigint 
		        LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>'id')::bigint 
		    WHERE (
		    	(status_id NOT IN (SELECT(UNNEST(ARRAY[4])))) 
		    	AND type_id = 1 
		    	AND a.from_id NOT IN(SELECT(UNNEST(ARRAY[0])))
		    )
		    GROUP BY 1, 2
		    ORDER BY 1
		) t on a.product_id = t.product_id 
		WHERE (
			 EXTRACT(YEAR FROM a.created) = EXTRACT(YEAR FROM now())
--			 AND a.location_id IN(SELECT(UNNEST(ARRAY[1,2,3,4,13]))) 
--			 AND a.manufacturer_id IN(SELECT(UNNEST(ARRAY[9924])))
		)
	
	) t;