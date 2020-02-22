CREATE OR REPLACE VIEW view_license_types AS
 SELECT a.id,
    a.name
   FROM crm_license_types a
  ORDER BY a.id;