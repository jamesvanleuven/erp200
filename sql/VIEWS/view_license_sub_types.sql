CREATE OR REPLACE VIEW view_license_sub_types AS
 SELECT a.id,
    a.name
   FROM crm_license_sub_types a
  ORDER BY a.id;