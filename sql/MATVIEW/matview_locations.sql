DROP MATERIALIZED VIEW IF EXISTS matview_locations CASCADE;
DROP INDEX IF EXISTS "matview_locations_id_seq" CASCADE;

CREATE MATERIALIZED VIEW matview_locations
AS SELECT 
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

CREATE UNIQUE INDEX "matview_locations_id_seq" ON matview_locations(id);
REFRESH MATERIALIZED VIEW CONCURRENTLY matview_locations;


SELECT * 
FROM UNNEST(ARRAY[377,9925]::bigint[]) id(id) 
LEFT OUTER JOIN matview_locations a ON a.id = id.id 
ORDER BY id.id;
