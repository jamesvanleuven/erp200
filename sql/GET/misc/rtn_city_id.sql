CREATE OR REPLACE FUNCTION public.rtn_city_id(_city character varying, _province integer)
 RETURNS TABLE(id integer, province_id integer)
 LANGUAGE sql
AS $function$

	SELECT COALESCE(a.id, 0) AS id, a.province_id 
	FROM sys_municipalities a
	WHERE a.township = _city AND a.province_id = _province;

$function$
