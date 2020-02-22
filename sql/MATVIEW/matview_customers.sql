DROP MATERIALIZED VIEW IF EXISTS matview_customers CASCADE;
DROP INDEX IF EXISTS "matview_customers_id_seq";

CREATE MATERIALIZED VIEW matview_customers
AS 

SELECT 
	a.id,
    a.license_number,
    replace(((''::text || a.key) || ''::text), '-'::text, ''::text) AS key,
    a.location_id,
    a.name AS customers,
    a.store_number,
    a.establishment_type_id,
    ( SELECT e.name
           FROM crm_establishment_types e
          WHERE (e.id = a.establishment_type_id)) AS establishment_type,
    COALESCE(a.license_type_id, (0)::bigint) AS license_type_id,
    ( SELECT c.name
           FROM crm_license_types c
          WHERE (c.id = a.license_type_id)) AS license_types,
    COALESCE(a.customer_type_id, (0)::bigint) AS customer_type_id,
    ( SELECT c.name
           FROM crm_customer_types c
          WHERE (c.id = a.customer_type_id)) AS customer_types,
    ( SELECT cc.abbr
           FROM crm_customer_types cc
          WHERE (cc.id = a.customer_type_id)) AS customer_abbr,
    COALESCE(a.license_sub_type_id, (0)::bigint) AS license_sub_type_id,
    ( SELECT d.name
           FROM crm_license_sub_types d
          WHERE (d.id = a.license_sub_type_id)) AS license_sub_types,
    a.delivery_days,
    to_char((a.opens)::interval, 'HH24:MI:SS'::text) AS opens,
    to_char((a.closes)::interval, 'HH24:MI:SS'::text) AS closes,
    a.notes,
    ( SELECT (((( SELECT y.street
                   FROM sys_addresses y
                  WHERE (y.id = aa.address_id)))::text || ', '::text) || (( SELECT x.township
                   FROM sys_municipalities x
                  WHERE (x.id = aa.city_id)))::text)
           FROM crm_establishments aa
          WHERE (aa.id = a.id)) AS address,
    a.address_id,
    ( SELECT y.street
           FROM sys_addresses y
          WHERE (y.id = a.address_id)) AS street,
    a.city_id,
    ( SELECT x.township
           FROM sys_municipalities x
          WHERE (x.id = a.city_id)) AS city,
    a.state_id,
    ( SELECT z.name_en
           FROM sys_provinces z
          WHERE (z.id = a.state_id)) AS state,
    a.zipcode,
    a.created,
    a.active
  FROM crm_establishments a
  WHERE (a.establishment_type_id NOT IN(1,2,3,31,32,37))
  ORDER BY a.id DESC;

/*
SELECT 
	a.id,
    a.license_number,
    replace(((''::text || a.key) || ''::text), '-'::text, ''::text) AS key,
    initcap(lower((a.name)::text)) AS customer,
    a.store_number,
    a.location_id,
    COALESCE(a.customer_type_id, (0)::bigint) AS customer_type_id,
    ( SELECT c.name FROM crm_customer_types c WHERE (c.id = a.customer_type_id)) AS customer_types,
    ( SELECT cc.abbr FROM crm_customer_types cc WHERE (cc.id = a.customer_type_id)) AS customer_abbr,
    ( SELECT array_to_json(array_agg(row_to_json(t.*))) AS array_to_json
           FROM ( SELECT aa.id,
                    initcap(lower((aa.name)::text)) AS value,
                    a.opens AS opens_at,
                    a.closes AS closes_at,
                    a.delivery_days
                   FROM crm_locations aa
                  WHERE (aa.establishment_id = a.id)) t) AS locations,
    a.establishment_type_id,
    b.value AS establishment_types,
    a.license_type_id,
    c.value AS license_types,
    a.license_sub_type_id,
    d.value AS license_sub_types,
    a.address_id,
    (((((((e.street)::text || ', '::text) || (f.township)::text) || ', '::text) || (f.province)::text) || ' '::text) || (a.zipcode)::text) AS address,
    e.street,
    a.city_id,
    f.township AS city,
    a.state_id,
    f.province AS state,
    a.zipcode,
	a.auto_invoicing,
    a.delivery_days,
    a.opens,
    a.closes,
    a.notes,
    a.created,
    a.active
FROM (((((crm_establishments a
	LEFT JOIN matview_establishment_types b ON ((b.id = a.establishment_type_id)))
	LEFT JOIN matview_license_types c ON ((c.id = a.license_type_id)))
	LEFT JOIN matview_license_sub_types d ON ((d.id = a.license_sub_type_id)))
	LEFT JOIN sys_addresses e ON ((e.id = a.address_id)))
	LEFT JOIN sys_municipalities f ON ((f.id = a.city_id)))
WHERE a.establishment_type_id NOT IN(1, 2, 3, 37)
ORDER BY a.id Desc, a.name Asc;
*/

CREATE UNIQUE INDEX "matview_customers_id_seq" ON matview_customers(id);
REFRESH MATERIALIZED VIEW public.matview_customers;
SELECT * FROM matview_customers ORDER BY id LIMIT 100;