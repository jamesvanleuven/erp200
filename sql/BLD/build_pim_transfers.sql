DROP TABLE IF EXISTS "public"."pim_transfers" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_transfers_id_seq";
CREATE SEQUENCE "public"."pim_transfers_id_seq";
CREATE TABLE "public"."pim_transfers"(
	id bigint DEFAULT nextval('pim_transfers_id_seq'::regclass) NOT NULL,
	user_id bigint DEFAULT 0 NOT NULL,
	manufacturer_id bigint DEFAULT 0 NOT NULL,
	route_id bigint DEFAULT 0 NOT NULL,
	from_id bigint DEFAULT 0 NOT NULL,
	to_id bigint DEFAULT 0 NOT NULL,
	products json DEFAULT '{}' NOT NULL,
	note_id integer[] DEFAULT '{}'::integer[] NOT NULL,
	status_id bigint DEFAULT 0 NOT NULL,
	delivery_date timestamp(6) without time zone DEFAULT (now() + '3 days'::interval) NULL,
	created timestamp(6) without time zone DEFAULT now() NULL
);