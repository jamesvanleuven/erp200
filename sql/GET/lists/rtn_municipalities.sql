CREATE OR REPLACE FUNCTION public.rtn_municipalities( _int bigint )
 RETURNS json
 LANGUAGE sql
AS $function$

	SELECT array_to_json(array_agg(row_to_json(tx))) municipalities
	FROM(
		SELECT 
		a.id,
		a.township AS "value"
		FROM matview_bc_municipalities a
		WHERE a.province_id = _int
		ORDER BY a.id
	) tx

$function$;

SELECT * FROM public.rtn_municipalities(2::bigint) AS municipalities;