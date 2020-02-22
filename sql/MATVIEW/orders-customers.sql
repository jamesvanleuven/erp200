DROP MATERIALIZED VIEW IF EXISTS matview_orders;
DROP MATERIALIZED VIEW IF EXISTS matview_customers;

CREATE MATERIALIZED VIEW matview_customers
AS 
SELECT a.id,
    a.license_number,
    replace(((''::text || a.key) || ''::text), '-'::text, ''::text) AS key,
    a.location_id,
    a.name AS customers,
    a.store_number,
		a.establishment_type_id,
		(SELECT e.name FROM crm_establishment_types e WHERE e.id = a.establishment_type_id) AS establishment_type,
    COALESCE(a.license_type_id, (0)::bigint) AS license_type_id,
    (SELECT c.name FROM crm_license_types c WHERE (c.id = a.license_type_id)) AS license_types,
--    (SELECT cc.abbr FROM crm_license_types cc WHERE (cc.id = a.license_type_id)) AS license_abbr,
    COALESCE(a.customer_type_id, (0)::bigint) AS customer_type_id,
    (SELECT c.name FROM crm_customer_types c WHERE (c.id = a.customer_type_id)) AS customer_types,
    (SELECT cc.abbr FROM crm_customer_types cc WHERE (cc.id = a.customer_type_id)) AS customer_abbr,
    COALESCE(a.license_sub_type_id, (0)::bigint) AS license_sub_type_id,
    (SELECT d.name FROM crm_license_sub_types d WHERE (d.id = a.license_sub_type_id)) AS license_sub_types,
    a.delivery_days,
	to_char(a.opens, 'HH12:MI:SS') AS opens,
	to_char(a.closes, 'HH12:MI:SS') AS closes,
    a.notes,
    (
    SELECT 
        (SELECT y.street FROM sys_addresses y WHERE (y.id = aa.address_id)) || ', ' ||
        (SELECT x.township FROM sys_municipalities x WHERE (x.id = aa.city_id)) 
    FROM crm_establishments aa WHERE aa.id = a.id        
    ) AS address,
    a.address_id,
    (SELECT y.street FROM sys_addresses y WHERE (y.id = a.address_id)) AS street,
    a.city_id,
    (SELECT x.township FROM sys_municipalities x WHERE (x.id = a.city_id)) AS city,
    a.state_id,
    (SELECT z.name_en FROM sys_provinces z WHERE (z.id = a.state_id)) AS state,
    a.zipcode,
    a.created,
    a.active
FROM crm_establishments a
WHERE (NOT (a.establishment_type_id = ANY (ARRAY[0, 1, 2, 3, 16, 31, 32, 33, 37])))
ORDER BY a.establishment_type_id, a.name;

CREATE UNIQUE INDEX "matview_customers_id_seq" ON matview_customers(id);
REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_customers;
SELECT * FROM matview_customers ORDER BY id LIMIT 100;

CREATE MATERIALIZED VIEW matview_orders
AS 
 SELECT a.id,
    a.id AS order_number,
    a.udf_reference AS order_reference,
    a.status_id,
    f.name AS status,
    a.user_id,
    (((b.firstname)::text || ' '::text) || (b.lastname)::text) AS full_name,
    a.customer_id,
    c.customers AS customer,
    g.id AS customer_type_id,
    g.name AS customer_type,
    g.abbr AS customer_abbr,
    h.id AS license_type_id,
    h.name AS license_type,
    h.abbr AS license_abbr,
    c.street AS address,
    c.city,
    a.manufacturer_id,
    d.manufacturers AS manufacturer,
    a.location_id,
    e.name AS location,
    a.paid,
    a.rush,
    a.pickup,
    ( SELECT json_array_length(x.products) AS json_array_length
           FROM pim_orders x
          WHERE (x.id = a.id)) AS total_lineitems,
    a.products,
    a.notes,
    a.created,
    a.delivery_date
   FROM pim_orders a
     LEFT JOIN crm_users b ON b.id = a.user_id
     LEFT JOIN matview_customers c ON c.id = a.customer_id
     LEFT JOIN matview_manufacturers d ON d.id = a.manufacturer_id
     LEFT JOIN matview_locations e ON e.id = a.location_id
     LEFT JOIN pim_statuses f ON f.id = a.status_id
     LEFT JOIN crm_customer_types g ON g.id = c.customer_type_id 
     LEFT JOIN crm_license_types h ON h.id = c.license_type_id
  ORDER BY a.delivery_date DESC, a.id DESC;

CREATE UNIQUE INDEX "matview_orders_id_seq" ON matview_orders(id);
REFRESH MATERIALIZED VIEW CONCURRENTLY matview_orders;
SELECT * FROM matview_orders;