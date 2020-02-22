SELECT 
	a.attname AS name
	, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
--       a.attnotnull
FROM pg_attribute a
  LEFT OUTER JOIN pg_class t on a.attrelid = t.oid
  LEFT OUTER JOIN pg_namespace s on t.relnamespace = s.oid
WHERE a.attnum > 0 
  AND NOT a.attisdropped
  AND t.relname = 'matview_products' 
  AND s.nspname = 'public' 
ORDER BY a.attnum;