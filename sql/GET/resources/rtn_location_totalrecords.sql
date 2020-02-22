CREATE OR REPLACE FUNCTION public.rtn_transfer_totalRecords(
    _manufacturer integer,
	_location integer, 
	_filter character varying
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_location ALIAS FOR $1;
	_filter ALIAS FOR $2;
	sql character varying;

BEGIN


	sql := 'SELECT row_to_json(t)'
    || ' FROM (SELECT count(a.*) FROM matview_transfers'
    || ' a WHERE (a.from_id = '
    || _location
    || ' OR a.to_id = '
    || _location
    || ')';
    
    IF _manufacturer > 0 THEN
        sql := sql || '' 
            || ' AND a.manufacturer_id = '
            || _manufacturer;
    END IF;

    IF _filter IS NOT NULL THEN
        sql := sql || ' ' 
            || _filter
            || ') t;';
    ELSE
        sql := sql || ') t;';
    END IF;

    RETURN QUERY EXECUTE sql;

END;

$function$;

SELECT * FROM rtn_transfer_totalRecords('1', null);