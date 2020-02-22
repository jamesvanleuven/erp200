DROP MATERIALIZED VIEW IF EXISTS matview_lineItems;

CREATE MATERIALIZED VIEW matview_lineItems
AS 
SELECT
	aa.id AS order_id, 
	-- (p->>'id')::bigint AS product_id,
	bb.*,
	(p->>'quantity')::integer AS quantity
	FROM public.pim_orders aa, json_array_elements(aa.products) p 
	LEFT OUTER JOIN pim_batch bb ON bb.product_id = (p->>'id')::bigint
	ORDER BY aa.id;

CREATE UNIQUE INDEX "matview_lineItems_id_seq" ON matview_lineItems(order_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_lineItems;