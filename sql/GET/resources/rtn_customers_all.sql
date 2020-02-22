DROP FUNCTION IF EXISTS public.rtn_customers_all(
	_limit integer
	, _offset integer
	, _establishment integer
	, _manufacturers integer[]
	, _locations integer[] -- ASSIGN TO FILTER IF OVER-RIDE = TRUE
	, _location integer -- ASSIGNED TO FILTER IF OVER-RIDE = FALSE
	, _group integer -- DEPRECATED
	, _role integer -- DEPRECATED
	, _filter character varying
);

CREATE OR REPLACE FUNCTION public.rtn_customers_all(
	_limit integer
	, _offset integer
	, _establishment integer
	, _manufacturers integer[]
	, _locations integer[]
	, _location integer
	, _group integer -- DEPRECATED
	, _role integer -- DEPRECATED
	, _filter character varying
) RETURNS json 
LANGUAGE sql
AS $function$	

	SELECT row_to_json(a2) AS results
	FROM (
			SELECT row_to_json(a3) AS customers
			FROM (
				SELECT 
					(SELECT * FROM rtn_customers(_limit, _offset, _filter)) AS items,
					(SELECT * FROM rtn_totalrecords(_location, _filter, 'customers')) AS totalRecords,
					(SELECT * FROM rtn_customers_assets()) AS assets
			) a3
	) a2;
	
$function$;