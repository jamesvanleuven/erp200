DROP FUNCTION IF EXISTS rtn_report_orders_count(
	integer[]
	, integer[]
	, character varying
);

CREATE OR REPLACE FUNCTION public.rtn_report_orders_count(
	_locations integer[]
	, _manufacturers integer[]
	, _filter character varying
) RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_locations ALIAS FOR $1;
	_manufacturers ALIAS FOR $2;
	_filter ALIAS FOR $3;
	sql character varying;

BEGIN

		sql := 'SELECT row_to_json(t) FROM ('
			|| 'SELECT count(a.*) FROM view_report_orders a'
			|| ' WHERE (a.status_id NOT IN(4)';
			
		IF array_length(_locations, 1) > 0 THEN
			sql := sql || ' AND a.shipping_id IN(SELECT(UNNEST('
				|| quote_literal(_locations)
				|| '::integer[])))';
		END IF;
		
		IF array_length(_manufacturers, 1) > 0 THEN
			sql := sql || ' AND a.manufacturer_id IN(SELECT(UNNEST('
				|| quote_literal(_manufacturers)
				|| '::integer[])))';
		END IF;
		
		IF _filter IS NOT NULL THEN
			sql := sql || _filter;
		END IF;
			
		sql := sql || ')) t;';

	RETURN QUERY EXECUTE sql;

END;

$function$;
