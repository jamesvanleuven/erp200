CREATE OR REPLACE FUNCTION public.rtn_report_transfers_all(
	_limit integer, 
	_offset integer, 
	_location integer, 
	_establishment integer, 
	_filter character varying
) RETURNS json
 LANGUAGE sql
AS $function$

	REFRESH MATERIALIZED VIEW CONCURRENTLY matview_transfers;
	
	SELECT row_to_json(t) AS "results" FROM (
		SELECT 
			-- RETURN TOTAL RECORDS COUNT
			(SELECT * FROM rtn_report_transfers_count(
				_location
				, _establishment
				, _filter
			)) AS "totalRecords"
		
			-- RETURN TRANSFERS REPORT
			, (SELECT * FROM rtn_report_transfers(
					_limit
					, _offset
					, _establishment
					, _location
					, _filter
			)) AS "items"
		
			-- RETURN RELEVENT ASSETS
			, (SELECT * FROM rtn_report_assets(
				_establishment
				, _location
			)) AS "assets"
	) t;
	
	
$function$;

REFRESH MATERIALIZED VIEW matview_transfers;

SELECT * 
FROM rtn_report_transfers_all(
	2
	, 0
	, 1
	, 377
	,' AND ((created_date >= ''2017-05-01 00:00:00'') AND (created_date <= ''2017-05-31 00:00:00''))'
);