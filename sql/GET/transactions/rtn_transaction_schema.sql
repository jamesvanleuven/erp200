CREATE OR REPLACE FUNCTION public.rtn_transaction_schema(_table character varying)
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(tx))) FROM(
		SELECT (
			SELECT row_to_json(t) 
			FROM (
					SELECT 
					a.name AS "alias",
					b.column_name AS "field",
					a.name AS "column",
					b.table_name AS "table",
		--						(SELECT * FROM rtn_element_permissions(a.permission_id)) AS "permissions",
					a.input,
					a.data_type,
					a.required,
					NULL AS "value"
				) t
			) AS "schema"
		FROM information_schema.columns b 
		LEFT OUTER JOIN cms_elements a ON a.column_name = b.column_name 
		WHERE b.table_name ILIKE '%' || _table || '%' 
		AND a.table_name ILIKE '%' || _table || '%'
		AND a.name IS NOT NULL
		ORDER BY b.ordinal_position
	) tx
$function$;

SELECT * FROM rtn_transaction_schema('pim_orders');