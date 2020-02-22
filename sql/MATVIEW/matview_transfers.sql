DROP MATERIALIZED VIEW IF EXISTS matview_transfers;

DROP INDEX IF EXISTS "matview_transfers_id_seq";

CREATE MATERIALIZED VIEW matview_transfers
AS 
SELECT 
	a.id,
	a.user_id,
	(((b.firstname)::text || ' '::text) || (b.lastname)::text) AS created_by,
	a.manufacturer_id,
	c.manufacturers AS manufacturer,
	a.from_id,
	d.name AS from_warehouse,
	a.to_id,
	e.name AS to_warehouse,
	a.status_id,
	f.name AS status,
	a.type_id,
	h.name AS transfer_type,
	json_array_length(a.products) AS total_lineItems,
	a.products,
	a.created,
	a.delivery_date,
	a.received_by AS received_id,
	a.received,
	(((g.firstname)::text || ' '::text) || (g.lastname)::text) AS received_by,
	a.received_date,
	a.notes,
	a.pickup,
	a.rush
FROM pim_transfers a
 LEFT JOIN crm_users b ON (b.id = a.user_id)
 LEFT JOIN matview_manufacturers c ON (c.id = a.manufacturer_id)
 LEFT JOIN matview_locations d ON (d.id = a.from_id)
 LEFT JOIN matview_locations e ON (e.id = a.to_id)
 LEFT JOIN pim_statuses f ON (f.id = a.status_id)
 LEFT JOIN crm_users g ON (g.id = a.received_by)
 LEFT JOIN pim_transfer_types h ON (h.id = a.type_id)
ORDER BY a.delivery_date DESC, a.id DESC
  
CREATE UNIQUE INDEX "matview_transfers_id_seq" ON matview_transfers(id);
REFRESH MATERIALIZED VIEW matview_transfers;
SELECT * FROM matview_transfers ORDER BY id Desc;