-- RESET PRODUCTS PK AND SEQUENCE COUNT
SELECT MAX(id) products_max_id FROM pim_products;
SELECT nextval('pim_products_id_seq') AS products_nextval;
SELECT setval('pim_products_id_seq', (SELECT MAX(id) FROM pim_products)) AS products_setval;
SELECT setval('pim_products_id_seq', COALESCE((SELECT MAX(id)+1 FROM pim_products), 1), false) AS products_val;

-- RESET BATCH PK AND SEQUENCE COUNT
SELECT MAX(id) batch_max_id FROM pim_batch;
SELECT nextval('pim_batch_id_seq') AS batch_nextval;
SELECT setval('pim_batch_id_seq', (SELECT MAX(id) FROM pim_batch)) AS batch_setval;
SELECT setval('pim_batch_id_seq', COALESCE((SELECT MAX(id)+1 FROM pim_batch), 1), false) AS batch_val;

-- RESET INVENTORY PK AND SEQUENCE COUNT
SELECT MAX(id) inventory_max_id FROM pim_inventory;
SELECT nextval('pim_inventory_id_seq') AS inventory_nextval;
SELECT setval('pim_inventory_id_seq', (SELECT MAX(id) FROM pim_inventory)) AS inventory_setval;
SELECT setval('pim_inventory_id_seq', COALESCE((SELECT MAX(id)+1 FROM pim_inventory), 1), false) AS inventory_val;

-- RESET ORDERS PK AND SEQUENCE COUNT
SELECT MAX(id) orders_max_id FROM pim_orders;
SELECT nextval('pim_orders_id_seq') AS orders_nextval;
SELECT setval('pim_orders_id_seq', (SELECT MAX(id) FROM pim_orders)) AS orders_setval;
SELECT setval('pim_orders_id_seq', COALESCE((SELECT MAX(id)+1 FROM pim_orders), 1), false) AS orders_val;

-- RESET TRANSFERS PK AND SEQUENCE COUNT
SELECT MAX(id) transfers_max_id FROM pim_transfers;
SELECT nextval('pim_transfers_id_seq') AS transfers_nextval;
SELECT setval('pim_transfers_id_seq', (SELECT MAX(id) FROM pim_transfers)) AS transfers_setval;
SELECT setval('pim_transfers_id_seq', COALESCE((SELECT MAX(id)+1 FROM pim_transfers), 1), false) AS transfers_val;

-- RESET ESTABLISHMENTS PK AND SEQUENCE COUNT
SELECT MAX(id) establishments_max_id FROM crm_establishments;
SELECT nextval('crm_establishments_id_seq') AS establishments_nextval;
SELECT setval('crm_establishments_id_seq', (SELECT MAX(id) FROM crm_establishments)) AS establishments_setval;
SELECT setval('crm_establishments_id_seq', COALESCE((SELECT MAX(id)+1 FROM crm_establishments), 1), false) AS establishments_val;

-- RESET LOCATIONS PK AND SEQUENCE COUNT
SELECT MAX(id) locations_max_id FROM crm_locations;
SELECT nextval('crm_locations_id_seq') AS locations_nextval;
SELECT setval('crm_locations_id_seq', (SELECT MAX(id) FROM crm_locations)) AS locations_setval;
SELECT setval('crm_locations_id_seq', COALESCE((SELECT MAX(id)+1 FROM crm_locations), 1), false) AS locations_val;

-- RESET CRM CONNECTOR PK AND SEQUENCE COUNT
SELECT MAX(id) crm_connector_max_id FROM crm_connector;
SELECT nextval('crm_connector_id_seq') AS crm_connector_nextval;
SELECT setval('crm_connector_id_seq', (SELECT MAX(id) FROM crm_connector)) AS crm_connector_setval;
SELECT setval('crm_connector_id_seq', COALESCE((SELECT MAX(id)+1 FROM crm_connector), 1), false) AS crm_connector_val;

-- RESET BI TYPES PK AND SEQUENCE COUNT
SELECT MAX(id) bi_types_id FROM bi_types;
SELECT nextval('bi_types_id_seq') AS bi_types_nextval;
SELECT setval('bi_types_id_seq', (SELECT MAX(id) FROM bi_types)) AS bi_types_setval;
SELECT setval('bi_types_id_seq', COALESCE((SELECT MAX(id)+1 FROM bi_types), 1), false) AS bi_types_val;