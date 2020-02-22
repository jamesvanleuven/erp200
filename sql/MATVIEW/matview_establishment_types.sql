DROP MATERIALIZED VIEW IF EXISTS matview_establishment_types;

CREATE MATERIALIZED VIEW matview_establishment_types
AS 
SELECT a.id,
    a.name AS value,
    a.abbr AS abbr
FROM crm_establishment_types a
ORDER BY a.id;


CREATE UNIQUE INDEX "matview_establishment_types_id_seq" ON matview_establishment_types(id);
REFRESH MATERIALIZED VIEW matview_establishment_types;
SELECT * FROM matview_establishment_types;
