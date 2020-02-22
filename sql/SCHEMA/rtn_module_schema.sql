CREATE OR REPLACE FUNCTION public.rtn_module_schema(
	_table character varying, 
	_module character varying
) RETURNS json 
LANGUAGE sql
AS $function$
	
	SELECT array_to_json(array_agg(row_to_json(t))) 
	FROM(
		SELECT
			a.id
			, a.name
			, a.alias
			, a.column_name AS "field"
			, a.name AS "column"
			,	a.table_name AS "table"
			, a.input
			, a.data_type
			, a.required
			, a.public_table as "visible"
			, NULL AS "value"
			, a.view_name AS "view"
		FROM information_schema.columns b 
		LEFT OUTER JOIN cms_elements a ON a.column_name = b.column_name 
		WHERE (
			(
				b.table_name ~* 'view_' || _module || '_schema'
			)
			AND 
			(
				(
					a.table_name ~* '' || _table || ''
				)
				AND
				(
					a.required = true
				)
			)
		)
		ORDER BY a.ordinal
	) t

$function$;

SELECT * FROM rtn_module_schema('pim_batch'::character varying, 'products'::character varying);