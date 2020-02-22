DROP VIEW IF EXISTS view_report_orders;

CREATE OR REPLACE VIEW view_report_orders AS
 SELECT DISTINCT ON(a.id) 
 	a.id AS order_id,
    a.total_lineitems,
    a.order_reference AS invoice_number,
    b.sku,
    ((p.value ->> 'id'::text))::bigint AS product_id,
    initcap(lower(b.product)) AS product,
    b.product_type_id,
    b.product_type,
    b.package_type_id,
    b.package_type,
    a.status_id,
    a.status,
    a.customer_id,
    initcap(lower(a.customer)) AS customer,
    b.manufacturer_id,
    initcap(lower(b.manufacturers)) AS manufacturer,
    c.location_id AS warehouse_id,
    initcap(lower((e.name)::text)) AS warehouse,
    ((p.value ->> 'quantity'::text))::integer AS quantity,
    ((p.value ->> 'price'::text))::numeric(10,2) AS price,
    ((p.value ->> 'calculatedPrice'::text))::numeric(10,2) AS case_total,
    ((((p.value ->> 'quantity'::text))::integer)::numeric * ((p.value ->> 'calculatedPrice'::text))::numeric(10,2)) AS total,
    a.delivery_date AS delivered,
    a.created
   FROM matview_orders a,
    ((((LATERAL json_array_elements(a.products) p(value)
     LEFT JOIN matview_products b ON ((b.product_id = ((p.value ->> 'id'::text))::bigint)))
     LEFT JOIN pim_inventory c ON ((c.product_id = ((p.value ->> 'id'::text))::bigint)))
     LEFT JOIN matview_locations e ON ((e.id = c.location_id)))
     LEFT JOIN matview_locations d ON ((d.id = c.location_id)))
  WHERE (a.status_id <> 4)
  ORDER BY a.id DESC, a.created, c.location_id, a.status_id;
  
  SELECT *
  FROM matview_report_orders 
  WHERE EXTRACT(MONTH FROM created) = EXTRACT(MONTH FROM NOW());