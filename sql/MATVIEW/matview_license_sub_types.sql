DROP MATERIALIZED VIEW IF EXISTS matview_license_sub_types;

CREATE MATERIALIZED VIEW matview_license_sub_types
AS 
SELECT a.id,
    a.name AS value
FROM crm_license_sub_types a
ORDER BY a.id;


CREATE UNIQUE INDEX "matview_license_sub_types_id_seq" ON matview_license_sub_types(id);
REFRESH MATERIALIZED VIEW matview_license_sub_types;
SELECT * FROM matview_license_sub_types;
