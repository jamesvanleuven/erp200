CREATE OR REPLACE FUNCTION public.rtn_transfers_all(

	_limit integer, 
	_offset integer, 
	_establishment integer, 
	_manufacturers integer[], 
	_customers integer[], 
	_locations integer[], 
	_location integer, 
	_filter character varying, 
	_startdate timestamp without time zone, -- OUTDATED
	_enddate timestamp without time zone -- OUTDATED
	
) RETURNS json
 LANGUAGE sql
AS $function$

	REFRESH MATERIALIZED VIEW CONCURRENTLY matview_transfers;
	
	SELECT row_to_json(t) AS "results"
	FROM (
			SELECT row_to_json(tt) AS "transfers"
			FROM (
				SELECT 
					(SELECT * FROM rtn_transfers(_limit, _offset, _establishment, _location, _filter)) AS "items",
					(SELECT * FROM rtn_transfer_count(_location, _establishment, _filter)) AS "totalRecords",
					(SELECT * FROM rtn_transfers_assets(_establishment, _manufacturers, _locations, _location)) AS "assets"
			) tt
	) t;
	
	
$function$;

SELECT * FROM rtn_transfers_all(
	25
	, 0
	, 377
	, ARRAY[]::integer[]
	, ARRAY[]::integer[]
	, ARRAY[1,2,3]::integer[]
	, 1
	, NULL
	, NULL
	, NULL
);