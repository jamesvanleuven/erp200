DROP FUNCTION IF EXISTS rtn_report_transactionSummary(
	integer
	, integer
	, integer
	, integer
	, character varying
);

CREATE OR REPLACE FUNCTION rtn_report_transactionSummary(

	_limit integer
	, _offset integer
	, _location integer
	, _manufacturer integer
	, _filter character varying
	
) RETURNS TABLE (
	results json
/*
	"TransferId" bigint
	, "Product Id" integer
	, "Product" character varying
	, "SKU" integer
	, "Production In" integer
	, "Transfer In" integer
	, "Transfer Out" integer
	, "Manual Adjustment" integer
	, "Orders" integer
	, "Inventory (un-allocated)" integer
*/
) LANGUAGE plpgsql
AS $function$

DECLARE 
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_location ALIAS FOR $3;
	_manufacturer ALIAS FOR $4;
	_filter ALIAS FOR $5;
	sql character varying;
	
	BEGIN
	
		sql := 'SELECT array_to_json(array_agg(row_to_json(t))) AS "summary"'
			|| ' FROM (SELECT a.transfer_id AS "Transfer Id"'
			|| ', a.product_id AS "Product Id"'
			|| ', a.product::character varying AS "Product"'
			|| ', a.sku::integer AS "SKU"'
			|| ', COALESCE(p.total, 0)::integer AS "Production In"'
			|| ', COALESCE(t.total, 0)::integer AS "Transfer In"'
			|| ', COALESCE(w.total, 0)::integer AS "Transfers Out"'
			|| ', COALESCE(m.total, 0)::integer AS "Manual Adjustments"'
			|| ', COALESCE(o.total, 0)::integer AS "Orders"'
			|| ', COALESCE(a.inventory::integer, 0)::integer AS "Inventory (un-allocated)" '
			|| ' FROM matview_report_transfers a'
			
			-- PRODUCTION IN
			|| ' LEFT JOIN ( SELECT a.product_id'
			|| ', COALESCE(SUM(a.quantity), 0) AS total'
			|| ' FROM matview_report_transfers a WHERE ('
			|| '(a.status_id = 7) AND'
			|| ' (a.type_id IN(2)) AND (a.warehouse_id = '
			|| _location
			|| ')) GROUP BY 1 ORDER BY 1) p ON p.product_id = a.product_id'
			
			
			-- WAREHOUSE IN
			|| ' LEFT JOIN ( SELECT a.product_id'
			|| ', COALESCE(SUM(a.quantity), 0) AS total'
			|| ' FROM matview_report_transfers a WHERE ('
			|| ' (a.status_id = 7) AND'
			|| ' (a.type_id IN(1)) AND (a.receiving_id = ' 
			|| _location
			|| ')) GROUP BY 1 ORDER BY 1) t ON t.product_id = a.product_id'
			
			-- WAREHOUSE OUT
			|| ' LEFT JOIN (SELECT a.product_id'
			|| ', COALESCE(SUM(a.quantity), 0) AS total'
			|| ' FROM matview_report_transfers a WHERE ((a.type_id = 1) AND (a.shipping_id = ' 
			|| _location
			|| ')) GROUP BY 1 ORDER BY 1) w ON w.product_id = a.product_id'
			
			-- MANUAL ADJUSTMENTS
			|| ' LEFT JOIN (SELECT a.product_id'
			|| ', COALESCE(SUM(a.quantity), 0) AS total'
			|| ' FROM matview_report_transfers a WHERE ((a.type_id = 3) AND (a.warehouse_id = '
			|| _location
			|| ' )) GROUP BY 1 ORDER BY 1 ) m ON m.product_id = a.product_id' 
			
			-- ORDERS
			|| ' LEFT JOIN (SELECT a.product_id'
			|| ', COALESCE(SUM(a.quantity), 0) AS total'
			|| ' FROM matview_report_orders a WHERE ( (a.warehouse_id = '
			|| _location 
			|| '))GROUP BY 1 ORDER BY 1 ) o ON o.product_id = a.product_id' 
			
			-- BUILT-IN FILTER
			|| ' WHERE (a.warehouse_id IN('
			|| _location
			|| '))';
			
		IF _manufacturer > 0 THEN
			sql := sql || ' AND (a.manufacturer_id IN('
				|| _manufacturer
				|| '))';
		END IF;
		
		IF _filter IS NOT NULL THEN
			sql := sql || _filter;
		END IF;
		
		sql := sql || ' GROUP BY 1,2,3,4,5,6,7,8,9,10 ORDER BY 1'; 
		
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

SELECT * FROM rtn_report_transactionSummary(
25,0,1,0,' AND (DATE(a.created) >= DATE(''2017-06-01 00:00:00'') AND DATE(a.created) <= DATE(''2017-06-30 23:59:59''))'
);