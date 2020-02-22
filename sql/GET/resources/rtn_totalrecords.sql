CREATE OR REPLACE FUNCTION public.rtn_totalRecords(
	_filter character varying,
    _module character varying
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_location ALIAS FOR $1;
	_filter ALIAS FOR $2;
    _module ALIAS FOR $3;
	sql character varying;

BEGIN

sql := 'SELECT row_to_json(t) FROM (SELECT count(a.*) FROM matview_'
    || _module
    || ' a WHERE a.active = true';

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

SELECT * FROM rtn_totalRecords(null, 'customers');