CREATE OR REPLACE VIEW view_establishment_types AS
 SELECT a.id,
    a.name
   FROM crm_establishment_types a
  ORDER BY a.id;