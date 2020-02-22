DROP MATERIALIZED VIEW IF EXISTS matview_license_types;

CREATE MATERIALIZED VIEW matview_license_types
AS 
SELECT a.id,
    a.name AS value,
    a.abbr
FROM crm_license_types a
ORDER BY a.id;

CREATE UNIQUE INDEX "matview_license_types_id_seq" ON matview_license_types(id);
REFRESH MATERIALIZED VIEW matview_license_types;
SELECT * FROM matview_license_types;
