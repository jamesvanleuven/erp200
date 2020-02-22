/**
 * Created: James Mendham <james.mendham@freshtap.com>
 * Date: 2016-01-22 18:24:24
 * File: parse_establishments_xls_import.sql
 * RunTime: 10 - 15 seconds
 *
 * Details:
 * ----------------------------------------------------
 * first insert of all related establishments
 * the crm_connector assigns the appropriate
 * definitions for each of the items in the 
 * establishments temp table by creating the
 * following primary tables:
 *	crm_establishments -> every location in bc
 *	crm_connector -> definitions for:
 *			establishment type
 *			license type
 *			license sub type
 * ----------------------------------------------------
 */

-- create crm_establishments table
DROP TABLE IF EXISTS "public"."crm_establishments_test";
DROP SEQUENCE IF EXISTS "public"."crm_establishment_test_id_seq";
CREATE SEQUENCE "public"."crm_establishment_test_id_seq";
CREATE TABLE "public"."crm_establishments_test" (
	"id" int8 PRIMARY KEY DEFAULT nextval('crm_establishment_test_id_seq'::regclass) NOT NULL,
	"license_number" int8 NOT NULL DEFAULT 0,
	"name" varchar(255) COLLATE "default",
	"street" varchar(500) COLLATE "default",
	"address_id" int4 NOT NULL default(0),
	"city" varchar(255) COLLATE "default",
	"city_id" int4 NOT NULL default(0),
	"state" varchar(255) COLLATE "default",
	"state_id" int4 NOT NULL default(0),
	"zipcode" varchar(30) COLLATE "default",
	"establishment_type_id" int4 NOT NULL default(0), 
	"license_type_id" int4 NOT NULL default(0), 
	"license_sub_type_id" int4 NOT NULL default(0),
	"geodata" varchar(5000) NOT NULL default('{}'),
	"created" timestamp(6) NULL DEFAULT now(),
	"active" bool NOT NULL DEFAULT true 
);

-- create crm_connector table
DROP TABLE IF EXISTS "public"."crm_connector_test";
DROP SEQUENCE IF EXISTS "public"."crm_connector_test_id_seq";
CREATE SEQUENCE "public"."crm_connector_test_id_seq";
CREATE TABLE "public"."crm_connector_test" (
	"id" int8 PRIMARY KEY DEFAULT nextval('crm_connector_test_id_seq'::regclass) NOT NULL,
	"establishment_id" int4 NOT NULL default(0),
	"establishment_type_id" int4 NOT NULL default(0),
	"license_type_id" int4 NOT NULL default(0),
	"license_sub_type_id" int4 NOT NULL default(0),
	"details_id" int4 NOT NULL default(0),
	"address_id" int4 NOT NULL default(0),
	"addresses" integer[] not null default '{}',
	"emails" integer[] not null default '{}',
	"phones" integer[] not null default '{}',
	"locations" integer[] not null default '{}'
);

-- insert into crm_establishments selected fields
-- from imported xls|csv created tmp_establishments document
WITH ins_a AS (
	INSERT INTO crm_establishments_test ( 
--		license_number, 
		name, 
		street, 
		city, 
		city_id, 
		state, 
		state_id, 
		zipcode,
		establishment_type_id, 
		license_type_id,  
		license_sub_type_id,
		address_id
    ) 	
-- select the relevant fields from tmp_establishments
	SELECT 
--		b.licence_number, 
		initcap(b.licensee) AS licensee, 
		initcap(b.address_1) AS street, 
		initcap(b.mailing_city) AS city,
		COALESCE(( select id from rtn_city_id(initcap(b.mailing_city), 2) LIMIT 1 ), 0),
		COALESCE(mailing_province, NULL) AS state,
		COALESCE(( select province_id from rtn_city_id(initcap(b.mailing_city), 2) LIMIT 1 ), 2),
		mailing_postal_code AS zipcode, 
		-- return correct integer field from crm_establishment_types table function
		-- to insert into crm_connector establishment_type_id field
		COALESCE(
			(select id from rtn_establishment_type(initcap(b.establishment_type)) LIMIT 1), 0), 
		-- return correct integer field from crm_license_types table function
		-- to insert into crm_connector license_type_id field
		COALESCE(( select id from rtn_license_type(initcap(b.licence_type)) LIMIT 1), 0),
		-- return correct integer field from crm_license_sub_types table function
		-- to insert into crm_conector license_sub_type_id field
		COALESCE(( select id from rtn_license_sub_type( initcap(b.licence_sub_type)) LIMIT 1), 0),
		-- return correct integer field from sys_addresses table insert function
		-- to insert into crm_connector address_id field
		-- ** an attempt to call the http_request of the address on insert to geo_text on sys_addresses 
		COALESCE((select id from rtn_addresses_id(initcap(b.address_1), COALESCE((select id from rtn_city_id(initcap(b.mailing_city),2) LIMIT 1 ),0)) LIMIT 1),0) 
	FROM tmp_establishments b
	WHERE (
			-- insert ONLY BC Establishments
			b.mailing_province IS NOT NULL AND 
			b.mailing_province = 'BC'
		) AND 
--		b.establishment_name IS NOT NULL AND 
		b.mailing_city IS NOT NULL AND 
		b.licensee IS NOT NULL 
	RETURNING id, establishment_type_id, license_type_id, license_sub_type_id, address_id 
) 
-- insert results into crm_connector table
INSERT INTO crm_connector_test (establishment_id, establishment_type_id, license_type_id, license_sub_type_id, address_id)
SELECT id, establishment_type_id, license_type_id, license_sub_type_id, address_id FROM ins_a;


/**
 * I NEED TO NOW PULL THE ADDRESS & CITY OR PROVINCE DATA IN ORDER
 * TO RETURN THE GEODATA OF LONG/LAT COORDINATES FOR EACH LOCATION
 * FOR ROUTING AND GENERIC EDIT INFORMATION
 * 
 * TODO:
 *		1: INSERT ADDRESS STREET GEODATA INTO public.sys_addresses 
 *			table from crm_establishments information 
 *			 i) Write HTTP_REQUEST from PostgreSQL in C++
 *
 *		2: INSERT ADDRESS_ID INTO public.crm_connector.addresses 
 *			ARRAY FOR ASSOCIATED ESTABLISHMENT
 *
 *		3: TABLE MANAGEMENT:
 *			 i) crm_establishments
 *				a) drop following columns:
 *					- "street" varchar(500) COLLATE "default",
 *					- "address_id" int4 NOT NULL default(0),
 *					- "city" varchar(255) COLLATE "default",
 *					- "city_id" int4 NOT NULL default(0),
 *					- "state" varchar(255) COLLATE "default",
 *					- "state_id" int4 NOT NULL default(0),
 *					- "zipcode" varchar(30) COLLATE "default",
 *					- "establishment_type_id" int4 NOT NULL default(0), 
 *					- "license_type_id" int4 NOT NULL default(0), 
 *					- "license_sub_type_id" int4 NOT NULL default(0),
 *			ii) tmp_establishments
 *				a) drop this temp table
 */


-- return results from joined tables
select 
	a.id AS "crm_establishments.id", 
	b.establishment_id AS "crm_connector.establishment_id", 
	a.name,
	b.establishment_type_id,
	c.name AS establishment_type_name,
	b.license_type_id,
	d.name AS license_type_name,
	b.license_sub_type_id,
	e.name AS license_sub_type_name, 
	a.street,
	a.address_id,
	a.city,
	a.city_id,
	a.state,
	a.state_id,
	a.zipcode
from crm_establishments_test a 
left outer join crm_connector b on b.establishment_id = a.id 
left outer join crm_establishment_types c on c.id = b.establishment_type_id 
left outer join crm_license_types as d on d.id = b.license_type_id 
left outer join crm_license_sub_types as e on e.id = b.license_sub_type_id 
WHERE 
	b.establishment_type_id = 0 AND 
	b.license_type_id = 0 AND 
	b.license_sub_type_id = 0;