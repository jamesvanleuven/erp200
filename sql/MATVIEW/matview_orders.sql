DROP MATERIALIZED VIEW IF EXISTS matview_orders CASCADE;
DROP INDEX IF EXISTS "matview_orders_id_seq";

CREATE MATERIALIZED VIEW matview_orders
AS 
SELECT 
	a.id,
    a.id AS order_number,
    a.udf_reference AS order_reference,
    c.license_number,
    a.status_id,
    f.name AS status,
    a.user_id,
    (((b.firstname)::text || ' '::text) || (b.lastname)::text) AS full_name,
    a.customer_id,
    initcap(lower((c.customers)::text)) AS customer,
    g.id AS customer_type_id,
    g.name AS customer_type,
    g.abbr AS customer_abbr,
    h.id AS license_type_id,
    h.name AS license_type,
    h.abbr AS license_abbr,
    concat(c.street, ', ', c.city, ' ', c.zipcode) AS address,
    c.city,
    a.manufacturer_id,
    initcap(lower(d.manufacturers)) AS manufacturer,
    a.location_id,
    initcap(lower((e.name)::text)) AS location,
    a.paid,
    a.promo,
    a.rush,
    a.pickup,
    json_array_length(a.products) AS total_lineitems,
    a.products,
    a.notes,
    a.created,
    a.delivery_date
   FROM (((((((pim_orders a
     LEFT JOIN crm_users b ON ((b.id = a.user_id)))
     LEFT JOIN matview_customers c ON ((c.id = a.customer_id)))
     LEFT JOIN matview_manufacturers d ON ((d.id = a.manufacturer_id)))
     LEFT JOIN matview_locations e ON ((e.id = a.location_id)))
     LEFT JOIN pim_statuses f ON ((f.id = a.status_id)))
     LEFT JOIN crm_customer_types g ON ((g.id = c.customer_type_id)))
     LEFT JOIN crm_license_types h ON ((h.id = c.license_type_id)))
  ORDER BY a.delivery_date DESC, a.id DESC;
  
CREATE UNIQUE INDEX "matview_orders_id_seq" ON matview_orders(id);
REFRESH MATERIALIZED VIEW CONCURRENTLY matview_orders;
SELECT * FROM matview_orders ORDER BY id Desc;