DROP TABLE public.cms_element_permissions;
DROP SEQUENCE "public"."cms_element_permissions_id_seq";
CREATE SEQUENCE "public"."cms_element_permissions_id_seq";
CREATE TABLE public.cms_element_permissions (
	id integer DEFAULT nextval('cms_element_permissions_id_seq'::regclass) NOT NULL,
	assignment_id integer DEFAULT 0 NOT NULL,
	permission_id integer DEFAULT 0 NOT NULL
);

DROP TABLE public.cms_elements;
DROP SEQUENCE "public"."cms_elements_id_seq";
CREATE SEQUENCE "public"."cms_elements_id_seq";
CREATE TABLE public.cms_elements (
	id integer DEFAULT nextval('cms_elements_id_seq'::regclass) NOT NULL,
	name character varying(100)  NULL,
	type_id integer DEFAULT 0 NOT NULL,
	created timestamp(6) without time zone DEFAULT now() NOT NULL,
	active boolean DEFAULT true NOT NULL,
	ico character varying(50)  NULL,
	permission_id integer  NULL
);

DROP TABLE public.cms_modules;
DROP SEQUENCE "public"."cms_modules_id_seq";
CREATE SEQUENCE "public"."cms_modules_id_seq";
CREATE TABLE public.cms_modules (
	id integer DEFAULT nextval('cms_modules_id_seq'::regclass) NOT NULL,
	name character varying(100)  NULL,
	type_id integer DEFAULT 0 NOT NULL,
	created timestamp(6) without time zone DEFAULT now() NOT NULL,
	active boolean DEFAULT true NOT NULL,
	ico character varying(50)  NULL,
	permission_id integer  NULL
);

DROP TABLE public.cms_permissions;
DROP SEQUENCE "public"."cms_permissions_id_seq";
CREATE SEQUENCE "public"."cms_permissions_id_seq";
CREATE TABLE public.cms_permissions (
	id integer DEFAULT nextval('cms_permissions_id_seq'::regclass) NOT NULL,
	name character varying(50)  NULL,
	description text  NULL,
	type_id integer DEFAULT 0 NOT NULL,
	_get boolean DEFAULT false NOT NULL,
	_post boolean DEFAULT false NOT NULL,
	_put boolean DEFAULT false NOT NULL,
	_patch boolean DEFAULT false NOT NULL,
	_delete boolean DEFAULT false NOT NULL,
	_print boolean DEFAULT false NOT NULL,
	_sys boolean DEFAULT false NOT NULL
);

DROP TABLE public.cms_type;
DROP SEQUENCE "public"."cms_type_id_seq";
CREATE SEQUENCE "public"."cms_type_id_seq";
CREATE TABLE public.cms_type (
	id integer DEFAULT nextval('cms_type_id_seq'::regclass) NOT NULL,
	name character varying(100)  NULL
);

DROP TABLE public.cms;
DROP SEQUENCE "public"."cms_id_seq";
CREATE SEQUENCE "public"."cms_id_seq";
CREATE TABLE public.cms (
	id bigint DEFAULT nextval('cms_id_seq'::regclass) NOT NULL,
	name character varying(100)  NULL,
	details text  NULL,
	rules jsonb DEFAULT '{}'::jsonb NULL
);