-- DROP CONSTRAINTS
ALTER TABLE pim_items DROP CONSTRAINT IF EXISTS FKpim_items451889;
ALTER TABLE pim_items DROP CONSTRAINT IF EXISTS FKpim_items479552;
ALTER TABLE pim_items DROP CONSTRAINT IF EXISTS FKpim_items171899;
ALTER TABLE pim_batch DROP CONSTRAINT IF EXISTS FKpim_batch652028;
ALTER TABLE pim_batch DROP CONSTRAINT IF EXISTS FKpim_batch652029;
ALTER TABLE pim_inventory DROP CONSTRAINT IF EXISTS FKpim_invent496085;

-- DROP TABLES
DROP TABLE IF EXISTS pim_adjustments CASCADE;
DROP TABLE IF EXISTS pim_audit CASCADE;
DROP TABLE IF EXISTS pim_batch CASCADE;
DROP TABLE IF EXISTS pim_inventory CASCADE;
DROP TABLE IF EXISTS pim_items CASCADE;
DROP TABLE IF EXISTS pim_notes CASCADE;
DROP TABLE IF EXISTS pim_products CASCADE;
DROP TABLE IF EXISTS pim_transfers CASCADE;
DROP TABLE IF EXISTS pim_types CASCADE;
DROP TABLE IF EXISTS pim_notes CASCADE;
DROP TABLE IF EXISTS pim_note_types CASCADE;

-- DROP SEQUENCES
DROP SEQUENCE IF EXISTS "public"."pim_products_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_batch_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_inventory_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_transfers_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_adjustments_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_items_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_audit_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_types_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_notes_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."pim_note_types_id_seq" CASCADE;

-- CREATE PRODUCTS TABLE
CREATE SEQUENCE "public"."pim_products_id_seq";
CREATE TABLE pim_products (
    id                bigint DEFAULT nextval('pim_products_id_seq'::regclass) NOT NULL,
    manufacturer_id   bigint DEFAULT 0 NOT NULL, 
    agent_number      bigint DEFAULT 0 NOT NULL, 
    sku               bigint DEFAULT 0 NOT NULL, 
    active            bool DEFAULT true NOT NULL, 
    PRIMARY KEY (id)
);

CREATE SEQUENCE "public"."pim_note_types_id_seq";
CREATE TABLE "public"."pim_note_types"(
    id                bigint DEFAULT nextval('pim_note_types_id_seq'::regclass) NOT NULL,
	module_id         bigint DEFAULT 0 NOT NULL,
    name              character varying(255) NULL,
    PRIMARY KEY (id)
);

-- CREATE BATCH PRODUCTS TABLE
CREATE SEQUENCE "public"."pim_batch_id_seq";
CREATE TABLE pim_batch (
    id                    bigint DEFAULT nextval('pim_batch_id_seq'::regclass) NOT NULL,
    product_id            bigint DEFAULT 0 NOT NULL, 
    upc                   varchar(255) DEFAULT NULL, 
    extended_sku          varchar(255) DEFAULT NULL, 
    user_reference        varchar(255) DEFAULT NULL, 
    name                  varchar(255) DEFAULT NULL, 
    litres_per_bottle     numeric(19, 4) DEFAULT 0.000 NOT NULL, 
    bottles_per_skid      integer DEFAULT 0 NOT NULL, 
    bottles_per_case      integer DEFAULT 0 NOT NULL, 
    alcohol_percentage    numeric(19, 4) DEFAULT 0.0000 NOT NULL, 
    litter_rate           numeric(19, 4) DEFAULT 0.0000 NOT NULL, 
    mfr_price             numeric(19, 2) DEFAULT 0.00 NOT NULL, 
    rtl_price             numeric(19, 2) DEFAULT 0.00 NOT NULL, 
    sp_price              numeric(19, 2) DEFAULT 0.00 NOT NULL, 
    promo                 bool DEFAULT false NOT NULL, 
    created               timestamp(6) without time zone DEFAULT now() NULL,
    active                bool DEFAULT true NOT NULL, 
    PRIMARY KEY (id)
);

-- CREATE INVENTORY TABLE
CREATE SEQUENCE "public"."pim_inventory_id_seq";
CREATE TABLE pim_inventory (
    id                bigint DEFAULT nextval('pim_inventory_id_seq'::regclass) NOT NULL,
    batch_id          bigint DEFAULT 0 NOT NULL, 
    location_id       bigint DEFAULT 0 NOT NULL,
    manufacturer_id   bigint DEFAULT 0 NOT NULL,
    quantity          integer DEFAULT 0 NOT NULL, 
    created           timestamp(6) without time zone DEFAULT now() NULL,
    updated           timestamp(6) without time zone DEFAULT now() NULL,
    active            bool DEFAULT true NOT NULL, 
    PRIMARY KEY (id)
);

-- CREATE TRANSFERS TABLE
CREATE SEQUENCE "public"."pim_transfers_id_seq";
CREATE TABLE pim_transfers (
    id                bigint DEFAULT nextval('pim_transfers_id_seq'::regclass) NOT NULL,
    user_id           bigint DEFAULT 0 NOT NULL, 
    route_id          bigint DEFAULT 0 NOT NULL, 
    route             boolean DEFAULT NULL, 
    location_from     bigint DEFAULT 0 NOT NULL, 
    location_to       bigint DEFAULT 0 NOT NULL, 
    ttl_products      integer DEFAULT 0 NOT NULL,
    ttl_items         integer DEFAULT 0 NOT NULL,
    note_id           integer[] DEFAULT '{}' NOT NULL,
    date_requested    timestamp(6) without time zone DEFAULT(NOW() + '3 days'::interval) NULL, 
    created           timestamp(6) without time zone DEFAULT now() NULL, 
    PRIMARY KEY (id)
);

-- CREATE ADJUSTMENTS TABLE
CREATE SEQUENCE "public"."pim_adjustments_id_seq";
CREATE TABLE pim_adjustments (
    id                bigint DEFAULT nextval('pim_adjustments_id_seq'::regclass) NOT NULL, 
    user_id           bigint DEFAULT 0 NOT NULL, 
    route_id          bigint DEFAULT 0 NOT NULL, 
    route             boolean DEFAULT NULL,  -- true = out, false = in
    location_from     bigint DEFAULT 0 NOT NULL, 
    location_to       bigint DEFAULT 0 NOT NULL, 
    ttl_products      integer DEFAULT 0 NOT NULL,
    ttl_items         integer DEFAULT 0 NOT NULL,
    note_id           integer[] DEFAULT '{}' NOT NULL,
    date_requested    timestamp(6) without time zone DEFAULT(NOW() + '3 days'::interval) NULL,
    created           timestamp(6) without time zone DEFAULT now() NULL, 
    PRIMARY KEY (id)
);

-- CREATE TRANSACTION ITEMS TABLE
CREATE SEQUENCE "public"."pim_items_id_seq";
CREATE TABLE pim_items (
    id                bigint DEFAULT nextval('pim_items_id_seq'::regclass) NOT NULL,
    type_id           bigint DEFAULT 0 NOT NULL, 
    transaction_id    bigint DEFAULT 0 NOT NULL, 
    batch_id          bigint DEFAULT 0 NOT NULL, 
    quantity          integer DEFAULT 0 NOT NULL, 
    PRIMARY KEY (id)
);

-- CREATE AUDIT TRANSACTIONS TABLE
CREATE SEQUENCE "public"."pim_audit_id_seq";
CREATE TABLE pim_audit (
    id            bigint DEFAULT nextval('pim_audit_id_seq'::regclass) NOT NULL,
    batch_id      bigint default 0 NOT NULL,
    inventory_id  bigint DEFAULT 0 NOT NULL, 
    item_id       bigint DEFAULT 0 NOT NULL, 
    type_id       bigint DEFAULT 0 NOT NULL, 
    note_id       integer[] DEFAULT '{}' NOT NULL,
    qty_start     integer DEFAULT 0 NOT NULL, 
    qty_end       integer DEFAULT 0 NOT NULL, 
    qty_diff      integer DEFAULT 0 NOT NULL, 
    details       text DEFAULT NULL,  -- INSERT PREDEFINED TEXT
    created       timestamp(6) without time zone DEFAULT now() NULL, 
    archived      boolean DEFAULT false NOT NULL,
    PRIMARY KEY (id)
);

-- CREATE PRODUCT TRANSACTION TYPES TABLE
CREATE SEQUENCE "public"."pim_types_id_seq";
CREATE TABLE pim_types (
    id      bigint DEFAULT nextval('pim_types_id_seq'::regclass) NOT NULL,
    name    varchar(255) DEFAULT NULL,
    PRIMARY KEY (id)
);

-- CREATE PRODUCT TRANSACTION NOTES TABLE
CREATE SEQUENCE "public"."pim_notes_id_seq";
CREATE TABLE pim_notes (
    id      bigint DEFAULT nextval('pim_notes_id_seq') NOT NULL,
    note_id bigint DEFAULT 0 NOT NULL,
    type_id bigint DEFAULT 0 NOT NULL,
    details text DEFAULT NULL,
    PRIMARY KEY (id)
);

-- CREATE UNIQUE INDICES
CREATE UNIQUE INDEX pim_adjustments_id ON pim_adjustments (id);
CREATE UNIQUE INDEX pim_audit_id ON pim_audit (id);
CREATE UNIQUE INDEX pim_batch_id ON pim_batch (id);
CREATE UNIQUE INDEX pim_inventory_id ON pim_inventory (id);
CREATE UNIQUE INDEX pim_items_id ON pim_items (id);
CREATE UNIQUE INDEX pim_products_id ON pim_products (id);
CREATE UNIQUE INDEX pim_transfers_id ON pim_transfers (id);
CREATE UNIQUE INDEX pim_types_id ON pim_types (id);
CREATE UNIQUE INDEX pim_notes_id ON pim_notes (id);

-- CREATE FOREIGN KEY CONSTRAINTS
ALTER TABLE pim_items ADD CONSTRAINT FKpim_items451889 FOREIGN KEY (transaction_id) REFERENCES pim_transfers (id);
ALTER TABLE pim_items ADD CONSTRAINT FKpim_items479552 FOREIGN KEY (transaction_id) REFERENCES pim_adjustments (id);
ALTER TABLE pim_items ADD CONSTRAINT FKpim_items171899 FOREIGN KEY (batch_id) REFERENCES pim_batch (id);
ALTER TABLE pim_batch ADD CONSTRAINT FKpim_batch652028 FOREIGN KEY (product_id) REFERENCES pim_products (id);
ALTER TABLE pim_batch ADD CONSTRAINT FKpim_batch652029 FOREIGN KEY (product_id) REFERENCES pim_products (id);
ALTER TABLE pim_inventory ADD CONSTRAINT FKpim_invent496085 FOREIGN KEY (batch_id) REFERENCES pim_batch (id);