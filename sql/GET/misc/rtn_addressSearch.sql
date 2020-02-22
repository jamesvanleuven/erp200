DROP FUNCTION IF EXISTS public.rtn_addresssearch(
	_street character varying
	, _city character varying
	, _province character varying
);

CREATE OR REPLACE FUNCTION public.rtn_addresssearch(
	_street character varying
	, _city character varying
	, _province character varying
) RETURNS TABLE ( 
	results json
) LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_street ALIAS FOR $1;
	_city ALIAS FOR $2;
	_province ALIAS FOR $3;
	sql character varying;

BEGIN

	sql := 'SELECT row_to_json(t) FROM ('
		|| 'SELECT (SELECT row_to_json(a) FROM (SELECT DISTINCT ON (aa.id) aa.id'
		|| ', aa.street AS value, aa.geodata FROM sys_addresses aa WHERE (aa.street ILIKE ''' 
		|| _street 
		|| '%'') LIMIT 1) a) AS street'
		|| ', (SELECT row_to_json(c) FROM (SELECT DISTINCT ON (a.id) a.id, a.township AS value LIMIT 1) c) AS city'
		|| ', (SELECT row_to_json(c) FROM (SELECT DISTINCT ON (b.id) b.id, b.name_en AS value, b.iso LIMIT 1) c) AS province'
		|| ' FROM sys_municipalities a LEFT OUTER JOIN sys_provinces b ON b.id = a.province_id'
		|| ' WHERE (LOWER(a.township) = '
		|| quote_literal(_city) 
		|| ' AND LOWER(b.name_en) = '
		|| quote_literal(_province)
		|| ')) t;';
		
		RETURN QUERY EXECUTE sql;

END;

$function$;

SELECT * FROM rtn_addresssearch('1575 vernon drive','vancouver','british columbia');