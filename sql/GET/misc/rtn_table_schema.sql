CREATE OR REPLACE FUNCTION public.rtn_table_schema(_table character varying)
 RETURNS json
 LANGUAGE sql
AS $function$
		SELECT array_to_json(array_agg(row_to_json(t))) AS "schema"
		FROM (
			SELECT 
				column_name,
				column_default,
				data_type,
				udt_name,
				is_nullable,
				is_identity
			FROM information_schema.columns 
			WHERE table_name = _table 
			ORDER BY ordinal_position
		) t
$function$;