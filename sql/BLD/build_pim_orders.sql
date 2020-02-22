DROP TABLE IF EXISTS "public"."pim_orders";
DROP SEQUENCE IF EXISTS "public"."pim_orders_id_seq";
CREATE SEQUENCE "public"."pim_orders_id_seq";
CREATE TABLE "public"."pim_orders"(
	id bigint DEFAULT nextval('pim_orders_id_seq'::regclass) NOT NULL,
	user_id bigint DEFAULT 0 NOT NULL,
	customer_id bigint DEFAULT 0 NOT NULL,
	manufacturer_id bigint DEFAULT 0 NOT NULL,
	route_id bigint DEFAULT 0 NOT NULL,
	location_id bigint DEFAULT 0 NOT NULL,
	invoice_id bigint DEFAULT 0 NOT NULL,
	paid boolean DEFAULT false NOT NULL,
	rush boolean DEFAULT false NOT NULL,
	promo boolean DEFAULT false NOT NULL,
	pickup boolean DEFAULT FALSE NOT NULL,
	pickup_type_id bigint DEFAULT 0 NOT NULL,
	products json DEFAULT '{}' NOT NULL,
	note_id integer[] DEFAULT '{}'::integer[] NOT NULL,
	status_id bigint DEFAULT 0 NOT NULL,
	delivery_date timestamp(6) without time zone DEFAULT (now() + '3 days'::interval) NULL,
	created timestamp(6) without time zone DEFAULT now() NULL
);

DROP TABLE IF EXISTS "public"."pim_statuses";
DROP SEQUENCE IF EXISTS "public"."pim_statuses_id_seq";
CREATE SEQUENCE "public"."pim_statuses_id_seq";
CREATE TABLE "public"."pim_statuses"(
    id bigint DEFAULT nextval('pim_statuses_id_seq'::regclass) NOT NULL,
    transaction_id integer[] DEFAULT '{}' NOT NULL,
    name character varying(255) NULL
);


DROP TABLE IF EXISTS "public"."pim_transactions";
DROP SEQUENCE IF EXISTS "public"."pim_transactions_id_seq";
CREATE SEQUENCE "public"."pim_transactions_id_seq";
CREATE TABLE "public"."pim_transactions"(
    id bigint DEFAULT nextval('pim_transactions_id_seq'::regclass) NOT NULL,
	module_id bigint DEFAULT 0 NOT NULL,
    name character varying(255) NULL
);