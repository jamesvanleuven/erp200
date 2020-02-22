DROP MATERIALIZED VIEW IF EXISTS matview_manufacturers CASCADE;
DROP INDEX IF EXISTS "matview_manufacturers_id_seq";

CREATE MATERIALIZED VIEW matview_manufacturers
AS 
SELECT 
	a.id,
    a.license_number,
    replace(((''::text || a.key) || ''::text), '-'::text, ''::text) AS key,
    initcap(lower((a.name)::text)) AS manufacturers,
    a.store_number,
/*
    a.location_id,
    ( SELECT array_to_json(array_agg(row_to_json(t.*))) AS array_to_json
           FROM ( SELECT aa.id,
                    initcap(lower((aa.name)::text)) AS value,
                    a.opens AS opens_at,
                    a.closes AS closes_at,
                    a.delivery_days
                   FROM crm_locations aa
                  WHERE (aa.establishment_id = a.id)) t) AS locations,
*/
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
WHERE (a.establishment_type_id IN(1,2,3,37))
ORDER BY a.id Asc;

CREATE UNIQUE INDEX "matview_manufacturers_id_seq" ON matview_manufacturers(id);
REFRESH MATERIALIZED VIEW matview_manufacturers;
SELECT * FROM matview_manufacturers ORDER BY id Desc;