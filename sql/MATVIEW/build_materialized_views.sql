-- DROP MATERIALIZED VIEWS IF EXISTS ---------------------------------------
DROP MATERIALIZED VIEW IF EXISTS matview_addresses CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_bc_municipalities CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_cda_provinces CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_customers CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_establishment_types CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_license_sub_types CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_license_types CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_locations CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_manufacturers CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_orders CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_transfers CASCADE;
DROP MATERIALIZED VIEW IF EXISTS matview_products CASCADE;

-- DROP UNIQUE INDICES ON MATERIALIZED VIEWS -------------------------------
-- CREATE UNIQUE INDICES ------------------------------------------------
DROP INDEX IF EXISTS "matview_addresses_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_bc_municipalities_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_cda_provinces_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_customers_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_customers_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_establishment_types_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_license_sub_types_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_license_types_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_locations_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_manufacturers_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_orders_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_transfers_id_seq" CASCADE;
DROP INDEX IF EXISTS "matview_products_id_seq" CASCADE;

-- CREATE MATERIALIZED VIEWS ------------------------------------------------

/* MATVIEW_ADDRESSES */
CREATE MATERIALIZED VIEW matview_addresses
AS 
SELECT 
    a.id,
    a.street,
    a.city_id,
    b.township,
    b.province_id,
    b.province
FROM (sys_addresses a
 LEFT JOIN sys_municipalities b ON ((b.id = a.city_id)))
WHERE (b.province_id = 2)
ORDER BY b.province_id, b.township;
  
  /* MATVIEW_CDA_PROVINCES */
CREATE MATERIALIZED VIEW matview_cda_provinces AS
 SELECT 
    a.id,
    a.iso,
    a.category,
    a.name_en,
    a.name_fr
   FROM sys_provinces a
  ORDER BY a.id;
/* MATVIEW_BC_MUNICIPALITIES */
CREATE MATERIALIZED VIEW matview_bc_municipalities
AS 
SELECT 
    a.id,
    a.province_id,
    a.township,
    a.type AS township_type,
    a.province,
    b.iso,
    b.name_en,
    b.name_fr
FROM (sys_municipalities a
 LEFT JOIN matview_cda_provinces b ON ((b.id = a.province_id)))
WHERE (a.province_id = '2'::bigint);

/* MATVIEW_CUSTOMERS */
CREATE MATERIALIZED VIEW matview_customers
AS 
 SELECT 
	a.id,
	a.license_number,
	replace(((''::text || a.key) || ''::text), '-'::text, ''::text) AS key,
	a.name AS customers,
	a.store_number,
	a.establishment_type_id,
	b.value AS establishment_types,
	a.license_type_id,
	c.value AS license_types,
	a.license_sub_type_id,
	d.value AS license_sub_types,
	a.address_id,
	(e.street || ', ' || f.township || ', ' || f.province || ' ' || a.zipcode) AS address,
	e.street,
	a.city_id,
	f.township AS city,
	a.state_id,
	f.province AS state,
	a.zipcode,
	a.created,
	a.active
FROM crm_establishments a
LEFT OUTER JOIN matview_establishment_types b ON b.id = a.establishment_type_id 
LEFT OUTER JOIN matview_license_types c ON c.id = a.license_type_id 
LEFT OUTER JOIN matview_license_sub_types d ON d.id = a.license_sub_type_id 
LEFT OUTER JOIN sys_addresses e ON e.id = a.address_id 
LEFT OUTER JOIN sys_municipalities f ON f.id = a.city_id
WHERE a.establishment_type_id NOT IN(1,2,3);

/* MATVIEW_ESTABLISHMENT_TYPES */
CREATE MATERIALIZED VIEW matview_establishment_types
AS 
 SELECT 
    a.id,
    a.name AS value,
    a.abbr
   FROM crm_establishment_types a
  ORDER BY a.id;

/* MATVIEW_LICENSE_SUB_TYPES */
CREATE MATERIALIZED VIEW matview_license_sub_types
AS 
 SELECT 
    a.id,
    a.name AS value
   FROM crm_license_sub_types a
  ORDER BY a.id;

/* MATIVEW_LICENSE_TYPES */
CREATE MATERIALIZED VIEW matview_license_types
AS 
 SELECT a.id,
    a.name AS value,
    a.abbr
   FROM crm_license_types a
  ORDER BY a.id;

/* MATVIEW_LOCATIONS */
CREATE MATERIALIZED VIEW matview_locations
AS 
	SELECT 
		a.id,
		b.license_number,
		b.key,
		a.establishment_id,
		a.name,
		a.type_id,
		a.address_id,
		c.street,
		c.city_id,
		d.township,
		b.state_id,
		d.province,
		b.zipcode,
		b.establishment_type_id,
		b.license_type_id,
		b.opens,
		b.closes,
		b.delivery_days,
		b.active
	FROM (((crm_locations a
	LEFT JOIN crm_establishments b ON ((b.id = a.establishment_id)))
	LEFT JOIN matview_addresses c ON ((c.id = a.address_id)))
	LEFT JOIN sys_municipalities d ON ((d.id = c.city_id)))
	ORDER BY a.name;

/* MATVIEW_MANUFACTURERS */
CREATE MATERIALIZED VIEW matview_manufacturers
AS 
 	SELECT a.id,
		a.license_number,
		replace(((''::text || a.key) || ''::text), '-'::text, ''::text) AS key,
		a.name AS manufacturers,
		a.store_number,
		a.location_id,
		(
			SELECT array_to_json(array_agg(row_to_json(t))) 
			FROM ( 
					SELECT
						aa.id
						, aa.name AS value
						, a.opens AS opens_at
						, a.closes AS closes_at
						, a.delivery_days
					FROM crm_locations aa 
					WHERE aa.establishment_id = a.id
			) t
		) AS locations,
		(
			SELECT count(bb.*) 
			FROM crm_locations bb 
			WHERE bb.establishment_id = a.id
		) AS totalLocations,
		a.establishment_type_id,
		b.value AS establishment_types,
		a.license_type_id,
		c.value AS license_types,
		a.license_sub_type_id,
		d.value AS license_sub_types,
		a.address_id,
		(e.street || ', ' || f.township || ', ' || f.province || ' ' || a.zipcode) AS address,
		e.street,
		a.city_id,
		f.township AS city,
		a.state_id,
		f.province AS state,
		a.zipcode,
		a.delivery_days,
		a.opens,
		a.closes,
		a.notes,
		a.created,
		a.active
  	FROM crm_establishments a
	LEFT OUTER JOIN matview_establishment_types b ON b.id = a.establishment_type_id 
	LEFT OUTER JOIN matview_license_types c ON c.id = a.license_type_id 
	LEFT OUTER JOIN matview_license_sub_types d ON d.id = a.license_sub_type_id 
	LEFT OUTER JOIN sys_addresses e ON e.id = a.address_id 
	LEFT OUTER JOIN sys_municipalities f ON f.id = a.city_id
  	WHERE a.establishment_type_id IN(1,2,3);

/* MATVIEW_ORDERS */
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
   FROM (((((((pim_orders a
     LEFT JOIN crm_users b ON ((b.id = a.user_id)))
     LEFT JOIN matview_customers c ON ((c.id = a.customer_id)))
     LEFT JOIN matview_manufacturers d ON ((d.id = a.manufacturer_id)))
     LEFT JOIN matview_locations e ON ((e.id = a.location_id)))
     LEFT JOIN pim_statuses f ON ((f.id = a.status_id)))
     LEFT JOIN crm_customer_types g ON ((g.id = c.customer_type_id)))
     LEFT JOIN crm_license_types h ON ((h.id = c.license_type_id)))
  ORDER BY a.delivery_date DESC, a.id DESC;
  
/* MATVIEW_TRANSFERS */
CREATE MATERIALIZED VIEW matview_transfers
AS 
 SELECT a.id,
    a.user_id,
    (((b.firstname)::text || ' '::text) || (b.lastname)::text) AS created_by,
    a.manufacturer_id,
    c.manufacturers AS manufacturer,
    a.from_id,
    d.name AS from_warehouse,
    a.to_id,
    e.name AS to_warehouse,
    a.status_id,
    f.name AS status,
    a.type_id,
    h.name AS transfer_type,
    ( SELECT json_array_length(x.products) AS json_array_length
           FROM pim_transfers x
          WHERE (x.id = a.id)) AS total_lineitems,
    a.products,
    a.created,
    a.delivery_date,
    a.received_by AS received_id,
    a.received,
    (((g.firstname)::text || ' '::text) || (g.lastname)::text) AS received_by,
    a.received_date,
    a.notes
   FROM (((((((pim_transfers a
     LEFT JOIN crm_users b ON ((b.id = a.user_id)))
     LEFT JOIN matview_manufacturers c ON ((c.id = a.manufacturer_id)))
     LEFT JOIN matview_locations d ON ((d.id = a.from_id)))
     LEFT JOIN matview_locations e ON ((e.id = a.to_id)))
     LEFT JOIN pim_statuses f ON ((f.id = a.status_id)))
     LEFT JOIN crm_users g ON ((g.id = a.received_by)))
     LEFT JOIN pim_transfer_types h ON ((h.id = a.type_id)))
  ORDER BY a.delivery_date, a.id;

/* MATVIEW_PRODUCTS */
CREATE MATERIALIZED VIEW matview_products
AS 
 SELECT b.id,
    a.id AS product_id,
    b.name AS product,
    c.id AS inventory_id,
    e.id AS manufacturer_id,
    e.manufacturers,
    c.location_id,
    d.name AS locations,
    a.sku,
    b.batch_id,
    b.batch_name,
    b.category_1 AS product_type_id,
    f.name AS product_type,
    b.category_2 AS package_type_id,
    h.name AS package_type,
    b.upc,
    b.litres_per_bottle,
    b.bottles_per_skid,
    b.bottles_per_case,
    b.alcohol_percentage,
    b.litter_rate,
    b.mfr_price,
    b.rtl_price,
    b.ws_price,
    b.notes,
    b.created,
    b.active,
    c.quantity,
    ( SELECT sum(f_1.quantity) AS sum
           FROM (pim_inventory f_1
             LEFT JOIN pim_batch g ON ((g.id = f_1.batch_id)))
          WHERE (f_1.batch_id = c.batch_id)) AS total_quantity
   FROM ((((((pim_products a
     RIGHT JOIN pim_batch b ON ((b.product_id = a.id)))
     RIGHT JOIN pim_inventory c ON ((c.batch_id = b.id)))
     LEFT JOIN crm_locations d ON ((d.id = c.location_id)))
     LEFT JOIN matview_manufacturers e ON ((e.id = c.manufacturer_id)))
     LEFT JOIN pim_product_types f ON ((f.id = b.category_1)))
     LEFT JOIN pim_package_type h ON ((h.id = b.category_2)))
  ORDER BY e.id DESC, a.id DESC, b.name;

-- CREATE UNIQUE INDICES ------------------------------------------------
CREATE UNIQUE INDEX "matview_addresses_id_seq" ON matview_addresses(id);
CREATE UNIQUE INDEX "matview_bc_municipalities_id_seq" ON matview_bc_municipalities(id);
CREATE UNIQUE INDEX "matview_cda_provinces_id_seq" ON matview_cda_provinces(id);
CREATE UNIQUE INDEX "matview_customers_id_seq" ON matview_customers(id);
CREATE UNIQUE INDEX "matview_establishment_types_id_seq" ON matview_establishment_types(id);
CREATE UNIQUE INDEX "matview_license_sub_types_id_seq" ON matview_license_sub_types(id);
CREATE UNIQUE INDEX "matview_license_types_id_seq" ON matview_license_types(id);
CREATE UNIQUE INDEX "matview_locations_id_seq" ON matview_locations(id);
CREATE UNIQUE INDEX "matview_manufacturers_id_seq" ON matview_manufacturers(id);
CREATE UNIQUE INDEX "matview_orders_id_seq" ON matview_orders(id);
CREATE UNIQUE INDEX "matview_transfers_id_seq" ON matview_transfers(id);
CREATE UNIQUE INDEX "matview_products_id_seq" ON matview_products(inventory_id);

-- REFRESH ALL MATERIALIZED VIEWS
REFRESH MATERIALIZED VIEW public.matview_addresses;
REFRESH MATERIALIZED VIEW public.matview_bc_municipalities;
REFRESH MATERIALIZED VIEW public.matview_cda_provinces;
REFRESH MATERIALIZED VIEW public.matview_customers;
REFRESH MATERIALIZED VIEW public.matview_establishment_types;
REFRESH MATERIALIZED VIEW public.matview_license_sub_types;
REFRESH MATERIALIZED VIEW public.matview_license_types;
REFRESH MATERIALIZED VIEW public.matview_locations;
REFRESH MATERIALIZED VIEW public.matview_manufacturers;
REFRESH MATERIALIZED VIEW public.matview_orders;
REFRESH MATERIALIZED VIEW public.matview_transfers;
REFRESH MATERIALIZED VIEW public.matview_products;