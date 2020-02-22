CREATE OR REPLACE VIEW view_bc_municipalities AS
 SELECT a.id,
    a.province_id,
    a.township,
    a.type AS township_type,
    a.province,
    b.iso,
    b.name_en,
    b.name_fr
   FROM (sys_municipalities a
     LEFT JOIN sys_provinces b ON ((b.id = a.province_id)))
  WHERE (a.province_id = 2)
  ORDER BY a.id;