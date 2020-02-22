/**
 *  CREATE MATVIEW ADDRESSES
 */
DROP MATERIALIZED VIEW IF EXISTS matview_addresses;
CREATE MATERIALIZED VIEW matview_addresses
AS 
	SELECT 
		a.id,
		b.id AS street_id,
		b.street,
		c.id AS city_id,
		c.township,
		c.province_id,
		c.province,
		a.id AS establishment_id,
		a.zipcode
	FROM crm_establishments a 
	RIGHT OUTER JOIN sys_addresses b ON b.id = a.address_id 
	RIGHT OUTER JOIN sys_municipalities c ON c.id = b.city_id 
	WHERE a.id IS NOT NULL 
	ORDER BY a.id;
CREATE UNIQUE INDEX "matview_addresses_id_seq" ON matview_addresses(id);
REFRESH MATERIALIZED VIEW matview_addresses;
-- SELECT * FROM matview_addresses;

/**
 *  CREATE MATVIEW CDA PROVINCES
 */
DROP MATERIALIZED VIEW IF EXISTS matview_cda_provinces;
CREATE MATERIALIZED VIEW matview_cda_provinces
AS 
SELECT a.id,
	b.iso,
    b.category,
    b.name_en,
    b.name_fr
   FROM (sys_municipalities a
     LEFT JOIN sys_provinces b ON ((b.id = a.province_id)));
CREATE UNIQUE INDEX "matview_cda_provinces_id_seq" ON matview_cda_provinces(id);
REFRESH MATERIALIZED VIEW matview_cda_provinces;
-- SELECT * FROM matview_cda_provinces;

/**
 *  CREATE MATVIEW BC MUNICIPALITIES
 */
DROP MATERIALIZED VIEW IF EXISTS matview_bc_municipalities;
CREATE MATERIALIZED VIEW matview_bc_municipalities
AS 
SELECT a.id,
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
CREATE UNIQUE INDEX "matview_bc_municipalities_id_seq" ON matview_bc_municipalities(id);
REFRESH MATERIALIZED VIEW matview_bc_municipalities;
-- SELECT * FROM matview_bc_municipalities;

/**
 *  CREATE MATVIEW ESTABLISMENT TYPES
 */
DROP MATERIALIZED VIEW IF EXISTS matview_establishment_types;
CREATE MATERIALIZED VIEW matview_establishment_types
AS 
SELECT a.id,
    a.name AS value
   FROM crm_establishment_types a
  ORDER BY a.id;
CREATE UNIQUE INDEX "matview_establishment_types_id_seq" ON matview_establishment_types(id);
REFRESH MATERIALIZED VIEW matview_establishment_types;
-- SELECT * FROM matview_establishment_types;

/**
 *  CREATE MATVIEW LICENSE TYPES
 */
DROP MATERIALIZED VIEW IF EXISTS matview_license_types;
CREATE MATERIALIZED VIEW matview_license_types
AS 
SELECT a.id,
    a.name AS value
   FROM crm_license_types a
  ORDER BY a.id;
CREATE UNIQUE INDEX "matview_license_types_id_seq" ON matview_license_types(id);
REFRESH MATERIALIZED VIEW matview_license_types;
-- SELECT * FROM matview_license_types;

/**
 *  CREATE MATVIEW LICENSE SUB TYPES
 */
DROP MATERIALIZED VIEW IF EXISTS matview_license_sub_types;
CREATE MATERIALIZED VIEW matview_license_sub_types
AS 
SELECT a.id,
    a.name AS value
   FROM crm_license_sub_types a
  ORDER BY a.id;
CREATE UNIQUE INDEX "matview_license_sub_types_id_seq" ON matview_license_sub_types(id);
REFRESH MATERIALIZED VIEW matview_license_sub_types;
-- SELECT * FROM matview_license_sub_types;

/**
 *  CREATE MATVIEW MANUFACTURERS
 */
DROP MATERIALIZED VIEW IF EXISTS matview_manufacturers;
CREATE MATERIALIZED VIEW matview_manufacturers
AS 
SELECT a.id,
    a.license_number,
    a.agent_number,
    a.location_id,
    a.name AS manufacturers,
    a.establishment_type_id,
    ( SELECT b.name
           FROM crm_establishment_types b
          WHERE (b.id = a.establishment_type_id)) AS establishment_types,
    a.license_type_id,
    ( SELECT c.name
           FROM crm_license_types c
          WHERE (c.id = a.license_type_id)) AS license_types,
    a.license_sub_type_id,
    ( SELECT d.name
           FROM crm_license_sub_types d
          WHERE (d.id = a.license_sub_type_id)) AS license_sub_types,
    a.address_id,
    a.city_id,
    a.state_id,
    a.zipcode,
    a.created,
    a.active
   FROM crm_establishments a
  WHERE (a.establishment_type_id <> 0 AND a.establishment_type_id <= '3'::bigint);
CREATE UNIQUE INDEX "matview_manufacturers_id_seq" ON matview_manufacturers(id);
REFRESH MATERIALIZED VIEW matview_manufacturers;
-- SELECT * FROM matview_manufacturers;

/**
 *  CREATE MATVIEW CUSTOMERS
 */
DROP MATERIALIZED VIEW IF EXISTS matview_customers;
CREATE MATERIALIZED VIEW matview_customers
AS 
SELECT a.id,
    a.license_number,
    a.agent_number,
    a.location_id,
    a.name AS customers,
    COALESCE(a.establishment_type_id, 0) AS establishment_type_id,
    ( SELECT b.name
           FROM crm_establishment_types b
          WHERE (b.id = a.establishment_type_id)) AS establishment_types,
    COALESCE(a.license_type_id, 0) AS license_type_id,
    ( SELECT c.name
           FROM crm_license_types c
          WHERE (c.id = a.license_type_id)) AS license_types,
    COALESCE(a.license_sub_type_id, 0) AS license_sub_type_id,
    ( SELECT d.name
           FROM crm_license_sub_types d
          WHERE (d.id = a.license_sub_type_id)) AS license_sub_types,
    a.address_id,
    a.city_id,
    a.state_id,
    a.zipcode,
    a.created,
    a.active
   FROM crm_establishments a
  WHERE (a.establishment_type_id <> 0 AND a.establishment_type_id > '3'::bigint);
CREATE UNIQUE INDEX "matview_customers_id_seq" ON matview_customers(id);
REFRESH MATERIALIZED VIEW matview_customers;
-- SELECT * FROM matview_customers;

/**
 *  CREATE MATVIEW PRODUCTS
 */
DROP MATERIALIZED VIEW IF EXISTS matview_products;
CREATE MATERIALIZED VIEW matview_products
AS 
SELECT
	c.id,
	b.product_id,
	c.batch_id,
	a.manufacturer_id,
	c.location_id,
	b.name AS products,
	a.agent_number,
	a.sku,
	b.extended_sku,
	b.upc,
	b.user_reference,
	b.litres_per_bottle,
	b.bottles_per_skid,
	b.bottles_per_case,
	b.alcohol_percentage,
	b.litter_rate,
	b.mfr_price,
	b.rtl_price,
	b.sp_price,
	b.promo,
	b.created,
	b.active,
	c.quantity AS "sub_total",
	(
		SELECT SUM(f.quantity) 
		FROM pim_inventory f 
		RIGHT OUTER JOIN pim_batch g on g.id = f.batch_id 
		WHERE f.batch_id = c.batch_id 
	) AS "total"
FROM pim_products a 
RIGHT OUTER JOIN pim_batch b ON b.product_id = a.id 
RIGHT OUTER JOIN pim_inventory c ON c.batch_id = b.id 
RIGHT OUTER JOIN crm_locations d ON d.id = c.location_id
RIGHT OUTER JOIN crm_establishments e ON e.id = d.establishment_id 
WHERE a.id IS NOT NULL -- AND c.location_id = '4'
-- GROUP BY 1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,18,19,20,21,22
ORDER BY c.location_id, c.id;
CREATE UNIQUE INDEX "matview_products_id_seq" ON matview_products(id);
REFRESH MATERIALIZED VIEW matview_products;
-- SELECT * FROM matview_products;