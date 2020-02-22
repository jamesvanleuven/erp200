SELECT DISTINCT ON((p->>'id')::bigint)
   a.manufacturer_id,
   a.location_id,
   (p->>'id')::bigint AS product_id,
   c.sku,
   c.name AS product,
   (SELECT aa.name FROM pim_statuses aa WHERE aa.id = a.status_id) AS status,
   sum((p->>'quantity')::integer) AS ordered
FROM pim_orders a, json_array_elements(a.products) p
    LEFT OUTER JOIN pim_products b ON b.id = (p->>'id')::bigint 
    LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>'id')::bigint 
WHERE (
    (p->>'id')::bigint > 0
    AND status_id IN(1,2,3) 
    AND a.location_id NOT IN(SELECT(UNNEST(ARRAY[0]))) 
)
GROUP BY 1,2,3,4,5,6
ORDER BY 3;