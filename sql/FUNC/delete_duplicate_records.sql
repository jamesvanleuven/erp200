DELETE FROM crm_establishments
WHERE id IN (SELECT id
FROM (
	SELECT 
		id,
		ROW_NUMBER() OVER (
			partition BY 
				license_number, 
				name, 
				establishment_type_id,
				license_type_id, 
				license_sub_type_id
			ORDER BY id
		) AS rnum
	FROM crm_establishments
) t
WHERE t.rnum > 1);