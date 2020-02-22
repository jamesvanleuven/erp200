DROP FUNCTION IF EXISTS public.rtn_report_summar_count(
    integer[]
    , integer[]
    , character varying
);

CREATE OR REPLACE FUNCTION public.rtn_report_summary_count(
	_locations integer[]
	, _manufacturers integer[]
	, _filter character varying
)
 RETURNS TABLE(result json)
 LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_locations ALIAS FOR $1;
	_manufacturers ALIAS FOR $2;
	_filter ALIAS FOR $3;
	sql character varying;

BEGIN

	sql := 'SELECT row_to_json(t) FROM (SELECT' 
		|| ' (SELECT count(a.*) FROM'
		|| ' matview_report_transfers a'
		|| ' WHERE (a.status_id NOT IN(4)';
		
	IF array_length(_locations, 1) > 0 THEN
		sql := sql || ' AND a.shipping_id IN(SELECT(UNNEST(' 
			|| quote_literal(_locations) || '::integer[])))';
	END IF;
	
	IF array_length(_manufacturers, 1) > 0 THEN
		sql := sql || ' AND a.manufacturer_id IN(SELECT(UNNEST(' 
			|| quote_literal(_manufacturers) || '::integer[])))';
	END IF;
	
	IF _filter IS NOT NULL THEN
		sql := sql || _filter;
	END IF;
		
	sql := sql || ')) AS transfers, (SELECT count(a.*)'
		|| ' FROM matview_report_orders a'
		|| ' WHERE (a.status_id NOT IN (4)';
	
	IF array_length(_locations, 1) > 0 THEN
		sql := sql || ' AND a.warehouse_id IN(SELECT(UNNEST(' 
			|| quote_literal(_locations) || '::integer[])))';
	END IF;
	
	IF array_length(_manufacturers, 1) > 0 THEN
		sql := sql || ' AND a.manufacturer_id IN(SELECT(UNNEST('
			|| quote_literal(_manufacturers) || '::integer[])))';
	END IF;
	
	IF _filter IS NOT NULL THEN
		sql := sql || _filter;
	END IF;
	
	sql := sql || ')) AS orders) t;';

	RETURN QUERY EXECUTE sql;

END;

$function$;

SELECT * FROM rtn_report_summary_count(
	ARRAY[6,14,1,2,3]
	,ARRAY[377,9925]
	,' AND (DATE(a.created) >= DATE(''2017-08-01 00:00:00'') AND DATE(a.created) <= DATE(''2017-08-30 23:59:59''))'
);