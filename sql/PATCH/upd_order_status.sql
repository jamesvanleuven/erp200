CREATE OR REPLACE FUNCTION public.upd_order_status(_items bigint[], _status integer)
 RETURNS json
 LANGUAGE sql
AS $function$


		UPDATE public.pim_orders 
		SET status_id = _status 
		WHERE id IN (SELECT(unnest(_items::bigint[])));

		SELECT array_to_json(array_agg(row_to_json(t))) 
		FROM (
			SELECT
				a.id,
				a.status_id AS status 
			FROM unnest(_items::bigint[]) id(id)
			LEFT OUTER JOIN public.pim_orders a ON a.id = id.id 
			ORDER BY a.id
		) t;

$function$;

SELECT * FROM public.upd_order_status( ARRAY[115, 116, 117, 118, 119]::bigint[], '1'::integer );