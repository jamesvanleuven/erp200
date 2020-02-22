CREATE OR REPLACE FUNCTION public.rtn_matview_schema(_table character varying, _matview character varying)
 RETURNS json
 LANGUAGE sql
AS $function$
		SELECT array_to_json(array_agg(row_to_json(t))) AS "schema"
		FROM (
			SELECT 
				b.attname, 
				format_type(b.atttypid, b.atttypmod) AS type,
				(
					SELECT array_to_json(array_agg(row_to_json(t2))) AS "table_schema" 
					FROM (
						SELECT 
							a.column_name,
							a.data_type,
							a.character_maximum_length,
							a.numeric_precision_radix
						FROM information_schema.columns a
						WHERE 
							a.table_name = _table
							AND a.column_name = b.attname 
						ORDER BY a.ordinal_position
					) t2
				) AS "table_schema"
			FROM   pg_attribute b
			WHERE  b.attrelid = _matview::regclass
			AND    b.attnum > 0
			AND    NOT b.attisdropped
			ORDER  BY b.attnum
		) t
$function$;