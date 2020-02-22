-- CRM (ROOT TABLE DEFINITION - TENTATIVE)
DROP TABLE IF EXISTS "public"."crm";
DROP SEQUENCE IF EXISTS "public"."crm_id_seq";

CREATE SEQUENCE "public"."crm_id_seq";
CREATE TABLE public.crm (
	id bigint DEFAULT nextval('crm_id_seq'::regclass) NOT NULL,
	name character varying(100)  NULL,
	details text  NULL,
	rules jsonb DEFAULT '{}'::jsonb NULL
);

-- CRM CONNECTOR (BRIDGE TABLE FOR CRM)
DROP TABLE IF EXISTS "public"."crm_connector";
DROP SEQUENCE IF EXISTS "public"."crm_connector_id_seq";

CREATE SEQUENCE "public"."crm_connector_id_seq";
CREATE TABLE public.crm_connector (
	id bigint DEFAULT nextval('crm_connector_id_seq'::regclass) NOT NULL,
	establishment_id bigint DEFAULT 0 NOT NULL,
	establishment_type_id bigint DEFAULT 0 NOT NULL,
	license_type_id bigint DEFAULT 0 NOT NULL,
	license_sub_type_id bigint DEFAULT 0 NOT NULL,
	details_id bigint DEFAULT 0 NOT NULL,
	address_id bigint DEFAULT 0 NOT NULL,
	addresses integer[] DEFAULT '{}'::integer[] NOT NULL,
	emails integer[] DEFAULT '{}'::integer[] NOT NULL,
	phones integer[] DEFAULT '{}'::integer[] NOT NULL,
	locations integer[] DEFAULT '{}'::integer[] NOT NULL,
	note_id bigint DEFAULT 0 NOT NULL
);

-- CRM DETAILS TABLE
DROP TABLE IF EXISTS "public"."crm_details";
DROP SEQUENCE IF EXISTS "public"."crm_details_id_seq";

CREATE SEQUENCE "public"."crm_details_id_seq";
CREATE TABLE public.crm_details (
	id bigint DEFAULT nextval('crm_details_id_seq'::regclass) NOT NULL,
	crm_id bigint DEFAULT 0 NOT NULL,
	addresses integer[] DEFAULT '{}'::integer[] NOT NULL,
	emails integer[] DEFAULT '{}'::integer[] NOT NULL,
	phones integer[] DEFAULT '{}'::integer[] NOT NULL,
	locations integer[] DEFAULT '{}'::integer[] NOT NULL,
	establishments integer[] DEFAULT '{}'::integer[] NOT NULL
);

-- CRM ESTABLISHMENT TYPES
DROP TABLE IF EXISTS "public"."crm_establishment_types";
DROP SEQUENCE IF EXISTS "public"."crm_establishment_types_id_seq";

CREATE SEQUENCE "public"."crm_establishment_types_id_seq";
CREATE TABLE "public"."crm_establishment_types" (
	"id" int8 PRIMARY KEY DEFAULT nextval('crm_establishment_types_id_seq'::regclass) NOT NULL,
	"name" varchar(250) COLLATE "default"
);

-- CRM ESTABLISHMENTS
DROP TABLE IF EXISTS "public"."crm_establishments";
DROP SEQUENCE IF EXISTS "public"."crm_establishment_id_seq";

DROP SEQUENCE IF EXISTS "public"."crm_establishment_id_seq1";
CREATE SEQUENCE "public"."crm_establishment_id_seq";
CREATE TABLE public.crm_establishments (
	id bigint DEFAULT nextval('crm_establishments_id_seq'::regclass) NOT NULL,
	license_number bigint DEFAULT 0 NOT NULL,
	name character varying(255)  NULL,
	address_id bigint DEFAULT 0 NOT NULL,
	city_id bigint DEFAULT 0 NOT NULL,
	state_id bigint DEFAULT 0 NOT NULL,
	zipcode character varying(30)  NULL,
	establishment_type_id bigint DEFAULT 0 NOT NULL,
	license_type_id bigint DEFAULT 0 NOT NULL,
	license_sub_type_id bigint DEFAULT 0 NOT NULL,
	created timestamp(6) without time zone DEFAULT now() NULL,
	active boolean DEFAULT true NOT NULL
);

-- CRM LICENSE SUB TYPES
DROP TABLE IF EXISTS "public"."crm_license_sub_types";
DROP SEQUENCE IF EXISTS "public"."crm_license_sub_types_id_seq";

CREATE SEQUENCE "public"."crm_license_sub_types_id_seq";
CREATE TABLE "public"."crm_license_sub_types" (
	"id" int8 PRIMARY KEY DEFAULT nextval('crm_license_sub_types_id_seq'::regclass) NOT NULL,
	"type_id" int8 NOT NULL DEFAULT(0),
	"name" varchar(150) COLLATE "default"
);

-- CRM LICENSE TYPES
DROP TABLE IF EXISTS "public"."crm_license_types";
DROP SEQUENCE IF EXISTS "public"."crm_license_types_id_seq";

DROP SEQUENCE IF EXISTS "public"."crm_license_types_id_seq1";
CREATE SEQUENCE "public"."crm_license_types_id_seq";
CREATE TABLE "public"."crm_license_types" (
	"id" int8 PRIMARY KEY DEFAULT nextval('crm_license_types_id_seq'::regclass) NOT NULL,
	"name" varchar(150) COLLATE "default"
);

-- CRM LOCATIONS
DROP TABLE IF EXISTS public.crm_locations;
DROP SEQUENCE IF EXISTS "public"."crm_locations_id_seq";

CREATE SEQUENCE "public"."crm_locations_id_seq";
CREATE TABLE public.crm_locations (
	id bigint DEFAULT nextval('crm_locations_id_seq'::regclass) NOT NULL,
	man_id bigint DEFAULT 0 NOT NULL,
	type_id bigint DEFAULT 0 NOT NULL,
	address_id bigint DEFAULT 0 NOT NULL,
	name character varying(150)  NULL,
	hwh boolean DEFAULT false NOT NULL
);

-- CRM NOTES
DROP TABLE IF EXISTS public.crm_notes;
DROP SEQUENCE IF EXISTS "public"."crm_notes_id_seq";

CREATE SEQUENCE "public"."crm_notes_id_seq";
CREATE TABLE public.crm_notes (
	id bigint DEFAULT nextval('crm_notes_id_seq'::regclass) NOT NULL,
	thread_id bigint DEFAULT 0 NOT NULL,
	user_id bigint DEFAULT 0 NOT NULL,
	title character varying(100) DEFAULT now() NOT NULL,
	details text DEFAULT 'No Note Entered'::text NOT NULL
);

-- CRM TYPE
DROP TABLE IF EXISTS public.crm_type;
DROP SEQUENCE IF EXISTS "public"."crm_type_id_seq";

CREATE SEQUENCE "public"."crm_type_id_seq";
CREATE TABLE public.crm_type (
	id bigint DEFAULT nextval('crm_type_id_seq'::regclass) NOT NULL,
	name character varying(100)  NULL
);

-- CRM USERS
DROP TABLE IF EXISTS "public"."crm_users";
DROP SEQUENCE IF EXISTS "public"."crm_users_id_seq";

CREATE SEQUENCE "public"."crm_users_id_seq";
CREATE TABLE public.crm_users (
	id bigint DEFAULT nextval('crm_users_id_seq'::regclass) NOT NULL,
	firstname character varying(100) DEFAULT NULL::character varying NULL,
	lastname character varying(100) DEFAULT NULL::character varying NULL,
	created timestamp(6) without time zone DEFAULT now() NOT NULL,
	active boolean DEFAULT true NOT NULL,
	key uuid DEFAULT uuid_generate_v4() NOT NULL
);