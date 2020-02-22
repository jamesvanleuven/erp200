CREATE OR REPLACE FUNCTION public.rtn_manufacturer_types(
	_manufacturers integer[]
)
 RETURNS json
 LANGUAGE sql
AS $function$
	SELECT array_to_json(array_agg(row_to_json(t))) 
	FROM (
		SELECT 
			a.id, 
			a.manufacturers AS value 
		FROM unnest(Array[_manufacturers]::integer[]) id (id)
		LEFT OUTER JOIN matview_manufacturers a ON a.id = id.id
		ORDER BY a.manufacturers
	) t;
$function$;

SELECT * FROM rtn_manufacturer_types(Array['362','16','67']::integer[]);