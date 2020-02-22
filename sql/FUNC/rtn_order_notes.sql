
DROP FUNCTION IF EXISTS public.rtn_order_notes(
	text
);

CREATE OR REPLACE FUNCTION public.rtn_order_notes(
	_type text
) RETURNS TABLE (

	id bigint
	, order_number bigint
	, customer_id bigint
	, customer character varying
	, manufacturer_id bigint
	, manufacturer character varying
	, author_id bigint
	, author character varying
	, type_id bigint
	, type character varying
	, note character varying
	, created timestamp without time zone
	
) LANGUAGE plpgsql
AS $function$

DECLARE 
	_type ALIAS FOR $1;
	
	BEGIN
	
		RETURN QUERY (
					SELECT 
						_order.id
						, _order.order_number
						, _order.customer_id
						, INITCAP(LOWER(_order.customer))::character varying AS "Customer"
						, _order.manufacturer_id
						, INITCAP(LOWER(_order.manufacturer))::character varying AS "Manufacturer"
						, (((_note.notes->'author'->>'id')::text)::bigint) AS "author_id"
						, (((_note.notes->'author'->>'FullName')::text)::character varying) AS "author"
						, (((_note.notes->'type'->>'id')::text)::bigint) AS "type_id"
						, COALESCE((((_note.notes->'type'->>'value')::text)::character varying), ' --- ') AS "type"
						, (((_note.notes->>'details')::text)::character varying) AS "note"
						, _order.created::timestamp without time zone
					------------------------------
					FROM matview_orders _order 
					------------------------------
					LEFT OUTER JOIN LATERAL (
						SELECT 
							n.id
							, (p.value) AS "notes"
						FROM matview_orders n, 
							LATERAL json_array_elements(n.notes) p(value)
						WHERE n.status_id NOT IN(4)
					) _note 
					ON _note.id = _order.id 
					------------------------------
					WHERE (
						((_note.notes->'type'->>'value')::text) ILIKE '%' || _type || '%'::text
					)
			);
	
	END;

$function$;

SELECT * FROM rtn_order_notes('issue');