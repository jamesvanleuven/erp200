SELECT 
	f.proname AS "name"
	,pg_get_functiondef(f.oid) AS "function"
	, f.proargnames AS "params"
	, n.nspname AS "namespace"
FROM pg_catalog.pg_proc f
INNER JOIN pg_catalog.pg_namespace n ON (f.pronamespace = n.oid)
WHERE (
	(n.nspname = 'public')
-- 	AND 
--	(f.proname ~* 'rtn_element_')
)
ORDER BY 2;