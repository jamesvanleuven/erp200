DROP FUNCTION IF EXISTS public.rtn_report_summary(
	integer
	, integer
	, integer[]
	, integer[]
	, character varying
);

CREATE OR REPLACE FUNCTION public.rtn_report_summary(
	_limit integer
	, _offset integer
	, _locations integer[]
	, _manufacturers integer[]
	, _filter character varying
) RETURNS TABLE (
	results json
) LANGUAGE plpgsql
AS $function$

DECLARE 
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_locations ALIAS FOR $3;
	_manufacturers ALIAS FOR $4;
	_filters ALIAS FOR $5;
	sql character varying;
	
	BEGIN
	
		sql := 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (SELECT '
			|| '(SELECT * FROM rtn_element_bigint(85, a.transfer_id::bigint)) AS transfer_id'
			|| ', (SELECT * FROM rtn_element_cs(90::bigint, a.product::text, a.product_id::bigint)) AS product'
			|| ', (SELECT * FROM rtn_element_bigint(89, a.sku::bigint)) AS sku'
			|| ', (SELECT * FROM rtn_element_integer(21, COALESCE(p.total, 0)::integer)) AS production_in'
			|| ', (SELECT * FROM rtn_element_integer(21, COALESCE(t.total, 0)::integer)) AS transfer_in'
			|| ', (SELECT * FROM rtn_element_integer(21, COALESCE(w.total, 0)::integer)) AS transfer_out'
			|| ', (SELECT * FROM rtn_element_integer(21,COALESCE(m.total, 0)::integer)) AS manual_adjustment'
			|| ', (SELECT * FROM rtn_element_integer(21, COALESCE(o.total, 0)::integer)) AS total_orders'
			|| ', (SELECT * FROM rtn_element_integer(21, COALESCE(a.inventory, 0)::integer)) AS inventory_unallocated' 
			|| ' FROM matview_report_transfers a '
		    
			|| ' LEFT JOIN (SELECT a.product_id, COALESCE(SUM(a.quantity), 0) AS total' 
			|| ' FROM matview_report_transfers a WHERE ((a.status_id::text = 7::text) AND (a.type_id::text = 2::text)' 
			|| ' AND (a.warehouse_id IN(SELECT(UNNEST('
			|| quote_literal(_locations)
			|| '::integer[]))))) GROUP BY 1 ORDER BY 1'
			|| ' ) p ON p.product_id = a.product_id '
		    
			|| ' LEFT JOIN (SELECT a.product_id, COALESCE( SUM(a.quantity), 0) AS total' 
			|| ' FROM matview_report_transfers a WHERE ((a.status_id::text = 7::text)AND (a.type_id::text = 2::text)' 
			|| ' AND (a.receiving_id IN(SELECT(UNNEST('
			|| quote_literal(_locations)
			|| '::integer[]))))) GROUP BY 1 ORDER BY 1'
			|| ' ) t ON t.product_id = a.product_id '
			    
			|| ' LEFT JOIN (SELECT a.product_id, COALESCE(SUM(a.quantity), 0) AS total' 
			|| ' FROM matview_report_transfers a WHERE ((a.type_id::text = 1::text)'
			|| ' AND (a.shipping_id IN(SELECT(UNNEST('
			|| quote_literal(_locations)
			|| '::integer[]))))) GROUP BY 1 ORDER BY 1'
			|| ' ) w ON w.product_id = a.product_id '
			    
			|| ' LEFT JOIN (SELECT a.product_id, COALESCE(SUM(a.quantity), 0) AS total' 
			|| ' FROM matview_report_transfers a WHERE ((a.type_id::text = 3::text)' 
			|| ' AND (a.warehouse_id IN(SELECT(UNNEST('
			|| quote_literal(_locations)
			|| '::integer[]))))) GROUP BY 1 ORDER BY 1'
			|| ' ) m ON m.product_id = a.product_id ' 
			    
			|| ' LEFT JOIN (SELECT a.product_id, COALESCE(SUM(a.quantity), 0) AS total '
			|| ' FROM matview_report_orders a WHERE ('
			|| ' (a.warehouse_id IN(SELECT(UNNEST('
			|| quote_literal(_locations)
			|| '::integer[]))))) GROUP BY 1 ORDER BY 1'
			|| ' ) o ON o.product_id = a.product_id '
			|| ' WHERE (';
			
		IF array_length(_locations, 1) > 0 THEN
			sql := sql || '(a.warehouse_id IN(SELECT(UNNEST('
				|| quote_literal(_locations)
				|| '::integer[]))))';
		END IF;
		
		IF array_length(_manufacturers, 1) > 0 THEN
			sql := sql || 'AND (a.manufacturer_id IN(SELECT(UNNEST('
				|| quote_literal(_manufacturers)
				|| '::integer[]))))'; 
		END IF;
		
		IF _filter IS NOT NULL THEN
			sql := sql || _filter 
				|| ') ORDER BY a.created Desc, a.transfer_id Asc';
		ELSE
			sql := sql || ') ORDER BY a.created Desc, a.transfer_id Asc';
		END IF;
		
		IF _limit > 0 THEN
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

SELECT * 
FROM public.rtn_report_summary(
	25
	, 0
	, ARRAY[1]::integer[]
	, ARRAY[362]::integer[]
	, ' AND (DATE(a.created) >= DATE(''2017-09-01 00:00:00'') AND DATE(a.created) <= DATE(''2017-09-30 23:59:59'')) AND CAST(a.warehouse_id AS TEXT) LIKE ''%1%'' AND CAST(a.manufacturer_id AS TEXT) LIKE ''%0%'''::character varying
);
