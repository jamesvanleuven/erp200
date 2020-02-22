DROP TABLE public.pim_version;
DROP SEQUENCE IF EXISTS "public"."pim_batch_id_seq";
DROP SEQUENCE IF EXISTS "public"."pim_version_id_seq";
CREATE SEQUENCE "public"."pim_batch_id_seq";
CREATE TABLE public.pim_batch (
	id integer DEFAULT nextval('pim_batch_id_seq'::regclass) NOT NULL,
	product_id integer DEFAULT(0) NOT NULL,
	item character varying(1000)  NULL,
	details text  NULL,
	created timestamp(6) without time zone DEFAULT now() NOT NULL
);