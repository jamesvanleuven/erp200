CREATE OR REPLACE VIEW view_manufacturers AS
 SELECT a.id,
    a.license_number,
    a.license_sub_type_id,
    ( SELECT row_to_json(t2.*) AS establishments
           FROM ( SELECT a.establishment_type_id AS id,
                    ( SELECT aa.name
                           FROM crm_establishment_types aa
                          WHERE (aa.id = a.establishment_type_id)) AS name,
                    ( SELECT row_to_json(tt1.*) AS method
                           FROM ( SELECT 'typeahead' AS input,
                                    'crm_establishment_types' AS "table") tt1) AS method) t2) AS establishments,
    ( SELECT row_to_json(t3.*) AS license_types
           FROM ( SELECT a.license_type_id AS id,
                    ( SELECT bb.name
                           FROM crm_license_types bb
                          WHERE (bb.id = a.license_type_id)) AS name,
                    ( SELECT row_to_json(tt2.*) AS method
                           FROM ( SELECT 'select' AS input,
                                    'crm_license_types' AS "table") tt2) AS method) t3) AS license_types,
    ( SELECT row_to_json(t4.*) AS license_sub_types
           FROM ( SELECT a.license_sub_type_id AS id,
                    ( SELECT cc.name
                           FROM crm_license_sub_types cc
                          WHERE (cc.id = a.license_sub_type_id)) AS name,
                    ( SELECT row_to_json(tt3.*) AS method
                           FROM ( SELECT 'select' AS input,
                                    'crm_license_sub_types' AS "table") tt3) AS method) t4) AS license_sub_types,
    ( SELECT row_to_json(t1.*) AS row_to_json
           FROM ( SELECT aa.street,
                    ( SELECT x.township
                           FROM sys_municipalities x
                          WHERE (x.id = aa.city_id)) AS city,
                    ( SELECT y.province
                           FROM sys_municipalities y
                          WHERE (y.id = a.city_id)) AS province,
                    ( SELECT z.zipcode
                           FROM crm_establishments z
                          WHERE (z.id = a.id)) AS postal_code,
                    ( SELECT row_to_json(tt3.*) AS method
                           FROM ( SELECT 'object' AS input) tt3) AS method
                   FROM sys_addresses aa
                  WHERE (aa.id = a.address_id)) t1) AS address
   FROM crm_establishments a;