DROP FUNCTION IF EXISTS public.rtn_report_summary_all(
	integer
	, integer
	, integer[]
	, integer[]
	, character varying
);

CREATE OR REPLACE FUNCTION public.rtn_report_summary_all(
	_limit integer
	, _offset integer
	, _locations integer[]
	, _manufacturers integer[]
	, _filter character varying
) RETURNS json LANGUAGE sql
AS $function$
	
	SELECT row_to_json(t)
	FROM (
			SELECT row_to_json(t1)
			FROM (
				SELECT 
					(SELECT * FROM rtn_report_summary(_limit, _offset, _locations, _manufacturers, _filter)) AS "items", 
 					(SELECT * FROM rtn_report_summary_count(_locations, _manufacturers, _filter)) AS "totalRecords",
					(SELECT * FROM rtn_report_assets(_locations, _manufacturers)) AS "assets"
			) t1
	) t;
	
$function$;

SELECT * 
FROM public.rtn_report_summary_all(
	25
	, 0
	, ARRAY[1]::integer[]
	, ARRAY[0]::integer[]
	, ' AND (DATE(a.created) >= DATE(''2017-09-01 00:00:00'') AND DATE(a.created) <= DATE(''2017-09-30 23:59:59'')) AND CAST(a.warehouse_id AS TEXT) LIKE ''%1%'' AND CAST(a.manufacturer_id AS TEXT) LIKE ''%0%'''::character varying
);