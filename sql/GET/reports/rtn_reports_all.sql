DROP FUNCTION IF EXISTS public.rtn_reports_all(
	_limit integer
	, _offset integer
	, _location integer[]
	, _establishment integer[]
	, _filter character varying
);

DROP FUNCTION IF EXISTS public.rtn_reports_all(
	_limit integer
	, _offset integer
	, _location integer
	, _establishment integer
	, _filter character varying
);

CREATE OR REPLACE FUNCTION public.rtn_reports_all(
	_limit integer
	, _offset integer
	, _location integer[]
	, _establishment integer[]
	, _filter character varying
) RETURNS json
 LANGUAGE sql
AS $function$

	REFRESH MATERIALIZED VIEW CONCURRENTLY matview_products;
	REFRESH MATERIALIZED VIEW CONCURRENTLY matview_transfers;
	REFRESH MATERIALIZED VIEW CONCURRENTLY matview_orders;
	
	SELECT row_to_json(t) AS "results" 
	FROM (
		SELECT 
		
			-- RETURN TOTAL RECORDS COUNT
			(
				SELECT row_to_json(t1)
				FROM (
					SELECT 
						0 AS summary
						, 0 AS transfers
						, 0 AS orders
						/*
						(SELECT * FROM rtn_report_transactionSummary_count(
							_location
							, _establishment
							, _filter
						)) AS "summary"
						
						, (SELECT * FROM rtn_report_transfers_count(
							_limit::integer
							, _offset::integer
							, _location
							, _establishment
							, _filter::character varying
						)) AS "transfers"
						
						, (SELECT * FROM rtn_report_orders_count(
							_location
							, _establishment
							, _filter
						)) AS "orders"
						*/
				) t1
			) AS "count",
		
		
			-- RETURN ROW ITEMS
			(
				SELECT row_to_json(t2) 
				FROM (
					SELECT
						-- RETURN TRANSACTION SUMMARY
						(SELECT * FROM rtn_report_summary(
							_limit
							, _offset
							, _location
							, _establishment
							, _filter
						)) AS "summary"
						
						-- RETURN TRANSFERS REPORT
						, (SELECT * FROM rtn_report_transfers(
								_limit
								, _offset
								, _location
								, _establishment
								, _filter
						)) AS "transfers"
						
						-- RETURN ORDERS REPORT
						, (SELECT * FROM rtn_report_orders(
								_limit
								, _offset
								, _location
								, _establishment
								, _filter
						)) AS "orders"
				) t2
			) AS "items"
		
			-- RETURN RELEVENT ASSETS
			-- (SELECT * FROM rtn_report_assets(
			--	_establishment
			--	, _location
			-- )) AS "assets"
	) t;
	
	
$function$;

SELECT * FROM rtn_reports_all(
	1
	,0
	,ARRAY[1,2,3]::integer[]
	,ARRAY[362]::integer[]
	,' AND (DATE(a.created) >= DATE(''2017-06-01 00:00:00'') AND DATE(a.created) <= DATE(''2017-06-30 23:59:59'')) '
);