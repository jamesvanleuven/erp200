DROP FUNCTION IF EXISTS public.bi_smmary_all(
    integer
    , integer
    , character varying
    , character varying
);

CREATE OR REPLACE FUNCTION public.bi_summary_all(
	_limit integer
	, _offset integer
	, _filter character varying
	, _paging character varying
) RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(t)
	FROM (
			SELECT row_to_json(t1)
			FROM (
				SELECT 
					(SELECT * FROM bi_summary(_limit, _offset, _filter, _paging)) AS "items", 
 					(SELECT * FROM bi_summary_count(_filter, _paging)) AS "totalRecords",
					(SELECT * FROM bi_assets()) AS "assets"
			) t1
	) t;
	
$function$;

SELECT * FROM public.bi_summary_all(25, 0, ' AND (DATE(a.created) >= DATE(''2017-09-01 00:00:00'') AND DATE(a.created) <= DATE(''2017-09-30 23:59:59'')) AND (a.location_id::integer IN(SELECT(UNNEST(ARRAY[1]::integer[])))) AND (a.manufacturer_id::integer NOT IN(SELECT(UNNEST(ARRAY[0]::integer[]))))', NULL );
