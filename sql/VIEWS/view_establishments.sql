CREATE 
OR REPLACE VIEW view_establishments AS 
SELECT 
	a.id,
	a.license_sub_type_id, 
-- RETURN THE ESTABLISHMENT crm_establishments.license_number
	(
		SELECT row_to_json(tt3) FROM (
			(
				SELECT row_to_json(tt2) FROM (
					SELECT
						'number' AS "input",
						'license_number' AS "field",
						'crm_establishments' AS "table",
						a.license_number AS "value",
						true AS "required",
						'bigint' AS "datatype",
						6 AS "minlength",
						30 AS "maxlength"
				) tt2
			)
		) tt3
	) AS "license_number",
-- RETURN THE ESTABLISHMENT crm_establishments.name
	(
		SELECT row_to_json(tt4) FROM (
			(
				SELECT 
					'text' AS "input",
					'name' AS "field",
					'crm_establishments' AS "table",
					a.name AS "value",
					true AS "required",
					'varchar(255)' AS "datatype",
					1 AS "minlength",
					255 AS "maxlength"
			)
		) tt4
	) AS "establishment",
-- RETURN THE ESTABLISHMENT ESTABLISHMENT TYPE FROM
-- crm_establishment_types WHERE crm_establishments.establishment_type_id = crm_establishment_types.id
	(
		SELECT row_to_json(tt5) FROM (
			(
				SELECT 
					'select' AS "input",
					'establishment_type_id' AS "field",
					'crm_establishments' AS "table",
					true AS "required",
					'bigint' AS "datatype",
					(SELECT * FROM rtn_establishment_types(0) ) AS "options",
					(
					 	SELECT row_to_json(xx) FROM (
							SELECT 
								a.establishment_type_id AS "id",
								(SELECT aa.name FROM crm_establishment_types aa WHERE aa.id = a.establishment_type_id) AS "name"
						) xx
					) AS "selected"
			)
		) tt5
	) AS "establishment_types",
-- RETURN THE ESTABLISHMENT LICENSE TYPE FROM
-- crm_license_types WHERE crm_establishments.license_type_id = crm_license_types.id
	(
		SELECT row_to_json(tt6) FROM (
			(
				SELECT 
					'select' AS "input",
					'license_type_id' AS "field",
					'crm_establishments' AS "table",
					true AS "required",
					'bigint' AS "datatype",
					(SELECT * FROM rtn_license_types(0) ) AS "options",
					(
					 	SELECT row_to_json(xx) FROM (
							SELECT 
								a.license_type_id AS "id",
								(SELECT aa.name FROM crm_license_types aa WHERE aa.id = a.license_type_id) AS "name"
						) xx
					) AS "selected"			
			)
		) tt6
	) AS "license_types",
-- RETURN THE ESTABLISHMENT LICENSE SUB TYPE FROM
-- crm_license_sub_types WHERE crm_establishments.license_sub_type_id = crm_license_sub_types.id
	(
		SELECT row_to_json(tt7) FROM (
			(
				SELECT 
					'select' AS "input",
					'license_sub_type_id' AS "field",
					'crm_establishments' AS "table",
					true AS "required",
					'bigint' AS "datatype",
					(SELECT * FROM rtn_license_sub_types(0) ) AS "options",
					(
					 	SELECT row_to_json(xx) FROM (
							SELECT 
								a.license_sub_type_id AS "id",
								(SELECT aa.name FROM crm_license_sub_types aa WHERE aa.id = a.license_sub_type_id) AS "name"
						) xx
					) AS "selected"
			)
		) tt7
	) AS "license_sub_types",
/**
 * 	RETURN THE ADDRESSES
 *************************************************
 *	I HAVEN'T DECIDED IF I'M GOING TO REFACTOR THIS
 *	OR IF I'M SIMPLY GOING TO LOAD THE ELEMENT OBJECTS
 *	IF THE USER SELECTS THIS TO EDIT
 *	
 *	WE HAVE MORE THAN ENOUGH INFORMATION HERE TO RENDER
 *	THE VIEW BUT NOT ENOUGH TO RENDER THE EDIT INFORMATION
 *	
 *	THE RETURN DATA IS MUCH TO LARGE TO RETURN SO IT'S ALMOST
 *	MORE INTELLIGENT TO RENDER A TYPEAHEAD (AT LEAST FOR MUNICIPALITES)
 *	FORCING A PROVINCE SEARCH
 */
	(
		SELECT 
			row_to_json(t1.*) AS row_to_json 
		FROM 
			(
				SELECT 
					aa.street,
					(
						SELECT row_to_json(t2) FROM (
							SELECT x.id, x.township AS "name" FROM sys_municipalities x WHERE (x.id = aa.city_id)
						) t2
					) AS "city",
					(
						SELECT row_to_json(t3) FROM (
							SELECT x.id, x.name_en AS "name" FROM sys_provinces x WHERE (x.id = aa.state_id)
						) t3
					) AS "province",
					(SELECT z.zipcode FROM crm_establishments z WHERE (z.id = a.id) ) AS "postal_code"
				FROM 
					crm_establishments aa 
				WHERE 
					(aa.id = a.id)
			) t1
	) AS address 
FROM 
	crm_establishments a;