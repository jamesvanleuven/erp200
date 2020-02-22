SELECT duplicateRecords, a.id, a.license_number, a.name, a.establishment_type_id, a.license_type_id, a.license_sub_type_id
FROM crm_establishments a INNER JOIN
     ( SELECT b.license_number, b.name,  COUNT(b.license_number) AS duplicateRecords
        FROM crm_establishments b
        GROUP BY b.license_number, b.name
        HAVING ( COUNT(b.license_number) > 1 ) ) AS duplicates
ON a.license_number = duplicates.license_number;

