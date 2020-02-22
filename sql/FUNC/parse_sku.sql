SELECT 
	substring(CAST(a.sku AS text) from '^\d+')::bigint AS sku
	, substring(CAST(a.sku AS text) from '[a-zA-Z][a-zA-Z0-9]*$')::character varying AS batch_id
FROM import_products a
WHERE CAST(a.sku AS CHARACTER VARYING) !~ '^[A-Za-z]+$' 
AND disabled = false;