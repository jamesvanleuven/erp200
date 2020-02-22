CREATE OR REPLACE FUNCTION public.rtn_table_rules(_table character varying)  RETURNS json
 LANGUAGE sql
AS $function$

SELECT array_to_json(array_agg(row_to_json(t4)))
FROM (

	SELECT
	    cols.column_name AS "column",
	    (
	        SELECT
	            pg_catalog.col_description(c.oid, cols.ordinal_position::int)
	        FROM pg_catalog.pg_class c
	        WHERE
	            c.oid     = (SELECT cols.table_name::regclass::oid) AND
	            c.relname = cols.table_name
	    ) as "rules"
	 
	FROM information_schema.columns cols
	WHERE
	    cols.table_catalog = 'v4' AND
	    cols.table_schema  = 'public' AND
	    cols.table_name    = _table

) t4
$function$;