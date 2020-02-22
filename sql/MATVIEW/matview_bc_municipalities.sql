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
SELECT * FROM matview_bc_municipalities;
