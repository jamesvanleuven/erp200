INSERT INTO cms_elements (
	name
	, permission_id
	, input
	, table_name
	, required
	, column_name
	, public_table
	, data_type
	, alias
	, view_name
	, _post
	, _put
	, _patch
	, _get
) VALUES (
	'product' -- name
	, 3 -- permission_id
	, 'cs' -- input
	, 'bi_reports' -- table_name
	, false -- required
	, 'not_allocated' -- column_name
	, true -- public_table
	, 'object' -- data_type
	, 'product' -- alias
	, 'reports' -- view_name
	, false -- _post
	, false-- _put
	, false -- _patch
	, true -- _get
) RETURNING id;

SELECT * FROM cms_elements ORDER BY id, name Desc;