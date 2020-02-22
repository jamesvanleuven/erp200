CREATE OR REPLACE VIEW view_lineItems_orders AS
SELECT aa.id AS order_id,
	bb.product_id,
	bb.batch_id,
	cc.manufacturer_id,
	cc.agent_number,
	( SELECT m.manufacturers
	   FROM matview_manufacturers m
	  WHERE (m.id = cc.manufacturer_id)) AS manufacturer,
	bb.sku,
	bb.name,
	bb.batch_name,
	bb.litres_per_bottle,
	bb.bottles_per_skid,
	bb.bottles_per_case,
	bb.alcohol_percentage,
	bb.litter_rate,
	bb.mfr_price,
	bb.rtl_price,
	bb.ws_price,
	bb.category_1 AS package_type,
	bb.category_2 AS product_type,
	((p.value ->> 'quantity'::text))::integer AS quantity,
	((p.value ->> 'price'::text))::numeric(10,2) AS order_price,
	dd.quantity AS inventory,
	dd.on_hold
FROM pim_orders aa,
(
		(
			LATERAL json_array_elements(aa.products) p(value)
			LEFT JOIN pim_batch bb ON (
				(
					bb.product_id = (
						(p.value ->> 'id'::text)
					)::bigint)
				)
		)
 LEFT JOIN pim_products cc ON (
				(
					cc.id = bb.product_id
				)
		) 
	LEFT JOIN pim_inventory dd ON (
				(
					dd.product_id = bb.product_id
				)
		)
) 
ORDER BY aa.id;