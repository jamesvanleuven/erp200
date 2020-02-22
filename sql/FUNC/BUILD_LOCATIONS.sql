CREATE OR REPLACE FUNCTION public.rtn_locations(
    _limit integer, 
    _offset integer, 
    _locations integer[], 
    _filter character varying
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$ 

DECLARE 
_limit ALIAS FOR $1;
_offset ALIAS FOR $2;
_locations text := _locations::text;
_filter ALIAS FOR $4;
sql character varying;

BEGIN

    REFRESH MATERIALIZED VIEW public.matview_locations;

	sql := 'SELECT array_to_json(array_agg(row_to_json(t)))  FROM ( SELECT id.id,';
	sql := sql || ' (SELECT * FROM rtn_element_select(''28''::bigint,b.name::text,b.id::bigint)) AS "locations",';
	sql := sql || ' (SELECT * FROM rtn_element_select(''30''::bigint,c.name::text,a.establishment_type_id::bigint)) AS "establishment_types",';
	sql := sql || ' (SELECT * FROM rtn_element_select(''29''::bigint,a.name::text,a.id::bigint)) AS "establishments",';
	sql := sql || ' (SELECT COUNT(*) FROM matview_locations) AS "totalRecords"';
	sql := sql || ' FROM unnest(''' || _locations || '''::integer[]) id(id)'; 
	sql := sql || ' LEFT OUTER JOIN crm_locations b ON b.id = id.id'; 
	sql := sql || ' LEFT OUTER JOIN crm_establishments a ON a.id = b.establishment_id'; 
	sql := sql || ' LEFT OUTER JOIN crm_establishment_types c ON c.id = a.establishment_type_id';
	sql := sql || ' WHERE a.state_id = ''2'' AND a.active = True AND b.active = True'; 
		IF _filter IS NOT NULL THEN
		sql := sql || _filter;
		END IF;
	sql := sql || ' ORDER BY id.id OFFSET 0 LIMIT 10) t';

    RETURN QUERY EXECUTE sql;

END;

$function$;

-- SELECT * FROM public.rtn_locations( 10, 0, ARRAY[1,2,3]::integer[],' AND a.establishment_type_id = 37' ) AS "locations";

CREATE OR REPLACE FUNCTION public.rtn_locations_assets(_establishment_id integer)
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "locations"
			FROM (
				SELECT 
					(SELECT * FROM rtn_warehouses(Array[1,2,3,37]::integer[])) AS "locations",
					(SELECT * FROM rtn_establishment_types(0)) AS "establishment_types",
					(SELECT * FROM rtn_establishments(_establishment_id::bigint)) AS "establishments"
			) a3
	) a2;

$function$;

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
					(SELECT * FROM rtn_locations(_limit::integer, _offset::integer, Array[_locations]::integer[], _filter::character varying)) AS "items",
					(SELECT * FROM rtn_locations_assets(_establishment::integer)) AS "assets"
			) a3
	) a2;

$function$;

SELECT * FROM rtn_locations_all(10::integer, 0::integer, 0::integer, Array[ '346', '192', '305', '218']::integer[], Array[ '1', '2', '3', '4', '5' ]::integer[], 1::integer, 1::integer, 1::integer, ' AND establishment_type_id = 37'::character varying);