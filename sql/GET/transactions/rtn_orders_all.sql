CREATE OR REPLACE FUNCTION public.rtn_orders_all(
	_limit integer, 
	_offset integer, 
	_establishment integer, 
	_manufacturers integer[], -- REDUNDANT
	_customers integer[], -- REDUNDANT
	_locations integer[], 
	_location integer, 
	_module integer, -- REDUNDANT
	_filter character varying, 
	_startdate timestamp without time zone, -- REDUNDANT
	_enddate timestamp without time zone -- REDUNDANT
) RETURNS json LANGUAGE sql
AS $function$

REFRESH MATERIALIZED VIEW CONCURRENTLY matview_orders;
	
	SELECT row_to_json(a2) AS "results" FROM (
		SELECT row_to_json(a3) AS "orders" FROM (
			SELECT 
				(SELECT * FROM rtn_orders(_limit, _offset, _establishment, _location, _filter)) AS "items",
				(SELECT * FROM rtn_transaction_totalRecords(_location, _establishment, _filter, 'orders')) AS "totalRecords",
				(SELECT * FROM rtn_orders_assets(_establishment, _locations)) AS "assets"
			) a3
	) a2;
	
$function$;
  
  
SELECT * FROM rtn_orders_all(25, 0, 0, ARRAY[]::integer[], ARRAY[]::integer[], ARRAY[1,2,3]::integer[], 1, 4, NULL, NULL, NULL);