CREATE OR REPLACE FUNCTION public.rtn_manufacturers(_limit integer, _offset integer, _location integer, _filter character varying)
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_location ALIAS FOR $3;
	_filter ALIAS FOR $4;
	sql character varying;

BEGIN

    

    sql := 'SELECT array_to_json(array_agg(row_to_json(xx))) FROM ( SELECT';
    sql := sql || ' a.id, a.location_id,';
    sql := sql || ' (SELECT * FROM rtn_element_integer(''1''::bigint,a.license_number::integer)) AS "license_number",';
    sql := sql || ' (SELECT * FROM rtn_element_integer(''7''::bigint,a.agent_number::integer)) AS "agent_number",';
    sql := sql || ' (SELECT * FROM rtn_element_text(''2''::bigint,a.manufacturers::text)) AS "manufacturers",';
    sql := sql || ' (SELECT * FROM rtn_element_select(''3''::bigint, a.establishment_types::text, a.establishment_type_id::bigint) ) AS "establishment_types",';
    sql := sql || ' (SELECT * FROM rtn_element_select(''4''::bigint, a.license_types::text, a.license_type_id::bigint) ) AS "license_types",';
    sql := sql || ' (SELECT * FROM rtn_element_select(''5''::bigint, a.license_sub_types::text, a.license_sub_type_id::bigint) ) AS "license_sub_types",';
    sql := sql || ' (SELECT * FROM rtn_element_boolean(''8''::bigint,a.active::boolean)) AS "is_active",';
    sql := sql || ' (SELECT COUNT(*) FROM matview_manufacturers) AS "totalRecords" FROM matview_manufacturers a';
    sql := sql || ' WHERE a.state_id = ''2'' AND a.location_id::integer[] @> ARRAY[' || _location || ']::integer[]';
        IF _filter IS NOT NULL THEN
        sql := sql || _filter;
        END IF;
    sql := sql || ' ORDER BY a.manufacturers OFFSET ' || _offset || ' LIMIT ' || _limit || ' ) xx';

    RETURN QUERY EXECUTE sql;

END;

$function$;

CREATE OR REPLACE FUNCTION public.rtn_manufacturers_assets()
 RETURNS json
 LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "manufacturers"
			FROM (
				SELECT 
					(SELECT rtn_establishment_types(0)) AS "establishment_types",
					(SELECT rtn_license_types(0)) AS "license_types",
					(SELECT rtn_license_sub_types(0)) AS "license_sub_types"
			) a3
	) a2;

$function$;

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

$function$