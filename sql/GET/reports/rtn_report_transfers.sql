DROP FUNCTION IF EXISTS public.rtn_report_transfers(
	integer
	, integer
	, integer[]
	, integer[]
	, character varying
);

CREATE OR REPLACE FUNCTION public.rtn_report_transfers(
	_limit integer
	, _offset integer
	, _locations integer[]
	, _manufacturers integer[]
	, _filter character varying
) RETURNS TABLE (
	results JSON
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
	
		sql := 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (SELECT'
			|| ' (SELECT * FROM rtn_element_bigint(34::bigint, a.transfer_id::bigint)) AS transfer_id'
			|| ', (SELECT * FROM rtn_element_cs(37::bigint, a.warehouse::text, a.warehouse_id::bigint)) AS location'
			|| ', (SELECT * FROM rtn_element_cs(37::bigint, a.manufacturer::text, a.manufacturer_id::bigint)) AS manufacturer'
			|| ', (SELECT * FROM rtn_element_text(47, a.product)) AS product'
			|| ', (SELECT * FROM rtn_element_bigint(34, a.sku::bigint)) AS sku'
			|| ', (SELECT * FROM rtn_element_integer(23, a.quantity)) AS quantity'
			|| ', (SELECT * FROM rtn_element_integer(23, a.inventory::integer)) AS inventory'
			|| ', (SELECT * FROM rtn_element_integer(23, a.total_transferred::integer)) AS total_transferred'
			|| ', (SELECT * FROM rtn_element_select(60, a.transfer_type, a.type_id)) AS transfer_type'
			|| ', (SELECT * FROM rtn_element_select(60, a.shipping_warehouse, a.shipping_id)) AS shipping_warehouse'
			|| ', (SELECT * FROM rtn_element_select(60, a.receiving_warehouse, a.receiving_id)) AS receiving_warehouse'
			|| ', (SELECT * FROM rtn_element_float(17, a.litres_per_bottle)) AS litres_per_bottle' 
			|| ', (SELECT * FROM rtn_element_integer(23, a.bottles_per_case)) AS bottles_per_case' 
			|| ', (SELECT * FROM rtn_element_integer(18, a.bottles_per_sku)) AS bottles_per_sku'
			|| ', (SELECT * FROM rtn_element_select(60, a.status, a.status_id)) AS status'
			|| ', (SELECT * FROM rtn_element_text(47, a.created_by)) AS created_by'
			|| ', (SELECT * FROM rtn_element_datetime(105, a.created::text)) AS created'
			|| ', (SELECT * FROM rtn_element_text(47, a.received_by)) AS received_by'
			|| ', (SELECT * FROM rtn_element_datetime(105, a.received::text)) AS received'
			|| ' FROM view_report_transfers a'
			|| ' WHERE ((a.status_id NOT IN(4))'; 
				
		IF array_length(_locations, 1) > 0 THEN
			sql := sql || 'AND (a.warehouse_id IN(SELECT(UNNEST(ARRAY['
				|| quote_literal(_locations)
				|| '::integer[]]))))';
		END IF;
		
		IF array_length(_manufacturers, 1) > 0 THEN 
			sql := sql || ' AND (a.manufacturer_id IN(SELECT(UNNEST(ARRAY['
				|| quote_literal(_manufacturers) 
				|| '::integer[]]))))';
		END IF;
			
		IF _filter IS NOT NULL THEN
		    sql := sql || _filter
		    	|| ') ORDER BY a.created Desc'
		    	|| ', a.warehouse_id Asc'
		    	|| ', a.manufacturer_id Asc';
		ELSE
		    sql := sql || ') ORDER BY'
		    	|| ' a.created Desc'
		    	|| ', a.warehouse_id Asc'
		    	|| ', a.manufacturer_id Asc';
		END IF;
		
		IF _limit IS NOT NULL OR _limit > 0 THEN
			sql := sql || ' OFFSET '
				|| _offset
				|| ' FETCH NEXT '
				|| _limit
				|| ' ROWS ONLY) t;';
		ELSE 
			sql := sql || ') t;';
		END IF;
		
		RETURN QUERY EXECUTE sql;
	
	END;
	
$function$;

SELECT * FROM rtn_report_transfers(25, 0, ARRAY[1,2,3], ARRAY[362], ' AND (a.created >= ''2017-06-01 00:00:00'' AND a.created <= ''2017-06-30 23:59:59'') ');
