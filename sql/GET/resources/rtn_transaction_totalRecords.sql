CREATE OR REPLACE FUNCTION public.rtn_transaction_totalRecords(
	_location integer, 
  _manufacturer integer,
	_filter character varying,
	_module character varying
) RETURNS TABLE(result json) 
LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_location ALIAS FOR $1;
  _manufacturer ALIAS FOR $2;
	_filter ALIAS FOR $3;
	_module ALIAS FOR $4;
	sql character varying;

BEGIN

sql := 'SELECT row_to_json(t)' 
		|| ' FROM ('
		|| ' SELECT count(a.*)' 
		|| ' FROM pim_' || _module || ' a' 
		|| ' WHERE a.location_id = '
		|| _location
		|| ' AND a.manufacturer_id = '
		|| _manufacturer;

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

SELECT * FROM rtn_transaction_totalRecords(1, 442, NULL, 'orders');