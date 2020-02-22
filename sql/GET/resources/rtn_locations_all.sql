CREATE OR REPLACE FUNCTION public.rtn_locations_all(
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
			SELECT row_to_json(a3) AS "locations"
			FROM (
				SELECT 
					(SELECT * FROM rtn_locations(_limit::integer, _offset::integer, Array[_locations]::integer[])) AS "items",
					(SELECT * FROM rtn_locations_assets(_establishment::integer)) AS "assets"
			) a3
	) a2;

$function$;

/*
SELECT * FROM rtn_locations_all(10::integer, 0::integer, 0::integer, Array[ '346', '192', '305', '218']::integer[], Array[ '1', '2', '3', '4', '5' ]::integer[], 1::integer, 1::integer, 1::integer, null::character varying);

SELECT * FROM rtn_locations_all(25, 0, 0, ARRAY[0]::integer[], ARRAY[1,2,3,4,5,6,7,13,14]::integer[], 1, 1, 1, NULL);
*/