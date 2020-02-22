CREATE OR REPLACE VIEW view_lineItems_transfers AS
 SELECT aa.id AS transfer_id,
    bb.product_id,
    bb.batch_id,
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
    cc.manufacturer_id,
    cc.agent_number,
    ((p.value ->> 'quantity'::text))::integer AS quantity
   FROM pim_transfers aa,
    ((LATERAL json_array_elements(aa.products) p(value)
     LEFT JOIN pim_batch bb ON ((bb.product_id = ((p.value ->> 'id'::text))::bigint)))
     LEFT JOIN pim_products cc ON ((cc.id = bb.product_id)))
  ORDER BY aa.id;