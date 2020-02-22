	-- DEVELOPMENT
CREATE OR REPLACE FUNCTION public.rtn_products_all(
    _limit integer, 
    _offset integer, 
    _establishment integer, 
    _manufacturers integer[], 
    _locations integer[], 
    _location integer, 
    _group integer, 
    _role integer, 
    _filter character varying
) RETURNS json
LANGUAGE sql
AS $function$
	
	SELECT row_to_json(t) AS "results"
	FROM (
		SELECT row_to_json(tt) AS "products"
		FROM (
			SELECT 
				(SELECT * FROM rtn_products(_limit, _offset, _establishment, _location)) AS "items",
				(SELECT * FROM rtn_count(_location, _establishment, _filter, 'products')) AS "totalRecords",
				(SELECT * FROM rtn_products_assets(Array[_manufacturers]::integer[])) AS "assets"
		) tt
	) t;

$function$;

SELECT * FROM rtn_products_all(10, 0, 0, Array['362','192','305']::integer[], Array['1','2','3','5']::integer[], 1, 1, 1);

/*
	-- PRODUCTION
CREATE OR REPLACE FUNCTION public.rtn_products_all(

	_limit integer, 
	_offset integer, 
	_establishment integer, 
	_manufacturers integer[], 
	_locations integer[], 
	_location integer, 
	_group integer, 
	_role integer, 
	_filter character varying
	
)
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) AS "results"
	FROM (
			SELECT row_to_json(a3) AS "products"
			FROM (
				SELECT 
					(SELECT * FROM rtn_products(_limit, _offset, _establishment, _location, _filter)) AS "items",
					(SELECT * FROM rtn_location_totalrecords(_location, _establishment, _filter, 'products')) AS "totalRecords",
					(SELECT * FROM rtn_products_assets(Array[_manufacturers]::integer[])) AS "assets"
					
			) a3
	) a2;
$function$;

SELECT * FROM rtn_products_all(
	25
	, 0
	, 377
	, ARRAY[]::integer[]
	, ARRAY[]::integer[]
	, 1
	, 1
	, 1
	, NULL
);

*/