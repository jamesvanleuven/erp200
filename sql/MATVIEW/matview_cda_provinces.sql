DROP MATERIALIZED VIEW IF EXISTS matview_cda_provinces;

CREATE MATERIALIZED VIEW matview_cda_provinces
AS 
SELECT a.id,
    a.iso,
    a.category,
    a.name_en,
    a.name_fr
   FROM (sys_municipalities a
     LEFT JOIN sys_provinces b ON ((b.id = a.province_id)));

CREATE UNIQUE INDEX "matview_cda_provinces_id_seq" ON matview_cda_provinces(id);
REFRESH MATERIALIZED VIEW matview_cda_provinces;
SELECT * FROM matview_cda_provinces;
