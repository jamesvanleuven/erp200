CREATE OR REPLACE FUNCTION public.rtn_report_transfers_admin(

	_limit integer, 
	_offset integer, 
	_locations integer[], 
	_manufacturers integer[], 
	_filter character varying
	
) RETURNS TABLE (
	
	id bigint
	, status_id bigint
	, status character varying
	, transfer_type character varying
	, "receiving_warehouse" character varying
	, "delivery_warehouse" character varying
	, manufacturer character varying
	, "create_date" timestamp without time zone
	, created_by text
	, "received_date" timestamp without time zone
	, received_by text
	, sku bigint
	, "product" character varying
	, litres_per_bottle numeric(10,4)
	, "quantity" integer
	
) LANGUAGE plpgsql
AS $function$

DECLARE 
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_locations ALIAS FOR $3;
	_manufacturers ALIAS FOR $4;
	_filter ALIAS FOR $5;
	sql character varying;
	
	BEGIN

		sql := 'SELECT'
			|| ' a.id'
			|| ', a.status_id'
			|| ', a.status'
			|| ', a.transfer_type AS "transfer_type"'
			|| ', a.to_warehouse AS "receiving_warehouse"'
			|| ', a.from_warehouse AS "delivery_warehouse"'
			|| ', a.manufacturer'
			|| ', a.created AS "create_date"'
			|| ', a.created_by::text'
			|| ', a.received_date AS "received_date"'
			|| ', a.received_by::text'
			|| ', b.sku'
			|| ', b.name AS "product"'
			|| ', b.litres_per_bottle::numeric(10,4) AS "litres_per_bottle"'
			|| ', ((p->>''quantity''::text)::integer) AS "quantity"'
			|| ' FROM matview_transfers a, (LATERAL json_array_elements(a.products) p(value)'
			|| ' LEFT JOIN pim_batch b ON (b.product_id = (p.value ->> ''id''::text)::bigint)'
			|| ' LEFT JOIN pim_products c ON (c.id = b.product_id)'
			|| ' LEFT JOIN pim_inventory d ON (d.product_id = b.product_id))'
			|| ' WHERE ((a.status_id NOT IN(4))'; -- IS NOT VOID
			
		IF array_length(_locations, 1) > 0 THEN
			sql := sql || 'AND (d.location_id IN(SELECT(UNNEST(ARRAY['
				|| quote_literal(_locations)
				|| '::integer[]]))))';
		END IF;
		
		IF array_length(_manufacturers, 1) > 0 THEN 
			sql := sql || ' AND (d.manufacturer_id IN(SELECT(UNNEST(ARRAY['
				|| quote_literal(_manufacturers) 
				|| '::integer[]]))))';
		END IF;
			
		IF _filter IS NOT NULL THEN
		    sql := sql || _filter
		    	|| ') ORDER BY a.created Desc'
		    	|| ', d.location_id Asc'
		    	|| ', d.manufacturer_id Asc';
		ELSE
		    sql := sql || ') ORDER BY'
		    	|| ' a.created Desc'
		    	|| ', d.location_id Asc'
		    	|| ', d.manufacturer_id Asc';
		END IF;
		
		IF _limit IS NOT NULL OR _limit > 0 THEN
			sql := sql || ' OFFSET '
				|| _offset
				|| ' FETCH NEXT '
				|| _limit
				|| ' ROWS ONLY;';
		ELSE 
			sql := sql || ';';
		END IF;
		
		RETURN QUERY EXECUTE sql;
	
	END;

$function$;

SELECT * FROM rtn_report_transfers_admin(
	1000, 
	0, 
	ARRAY[1]::integer[], 
	ARRAY[377]::integer[], 
	' AND (a.created >= ''05-01-2017 00:00:00'') AND (a.created <= ''06-15-2017 00:00:00'') '
);