CREATE OR REPLACE FUNCTION public.rtn_manufacturers_all(
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

    REFRESH MATERIALIZED VIEW matview_manufacturers;
	
	SELECT row_to_json(a2) AS "results"
	FROM (
			SELECT row_to_json(a3) AS "manufacturers"
			FROM (
				SELECT 
					(SELECT * FROM rtn_manufacturers(_limit, _offset, _location, _filter)) AS "items",
					(SELECT * FROM rtn_manufacturers_assets()) AS "assets",
					(
						SELECT array_to_json(array_agg(row_to_json(b))) 
						FROM (
							SELECT 
								m.id, 
								m.manufacturers AS "value"
							FROM unnest(Array[_manufacturers]::integer[]) iid
							LEFT JOIN matview_manufacturers m on m.id = iid 
							WHERE m.active = True
							ORDER BY m.id
						) b 
					) AS "manufacturers"
			) a3
	) a2;

$function$;


SELECT * FROM rtn_manufacturers_all(25, 0, 0, ARRAY[]::integer[], ARRAY[]::integer[], 1, 1, 1, NULL);