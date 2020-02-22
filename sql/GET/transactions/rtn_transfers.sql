DROP FUNCTION IF EXITS public.rtn_transfers(
	integer
	, integer
	, integer
	, integer[]
	, integer[]
	, integer
	, character varying
); 

CREATE OR REPLACE FUNCTION public.rtn_transfers(
	
	_limit integer
	, _offset integer
	, _establishment integer
	, _manufacturers integer[]
	, _locations integer[]
	, _location integer
	, _filter character varying
	
) RETURNS TABLE (
	transfers json
) LANGUAGE plpgsql
AS $function$ 

BEGIN

PERFORM rtn_transfers_view(

    _limit, 
    _offset, 
    _establishment, 
    _manufacturers,
    _locations,
    _location, 
    _filter

);

RETURN QUERY (
    SELECT array_to_json(array_agg(row_to_json(t))) 
    FROM (
        SELECT row_to_json(tt) 
        FROM (
            SELECT 
                id, 
                (SELECT * FROM rtn_element_text('79'::bigint, transfer_id::text)) AS "transfer_id", 
                (SELECT * FROM rtn_element_cs('38'::bigint, manufacturer::text, manufacturer_id::bigint)) AS "manufacturer",
                (SELECT * FROM rtn_manufacturers_list(ARRAY[manufacturer_id]::integer[])) AS "manufacturer_info",
                (SELECT * FROM rtn_element_select('52'::bigint, from_warehouse::text, from_id::bigint)) AS "from_warehouse",
                (SELECT * FROM rtn_element_select('53'::bigint, to_warehouse::text, to_id::bigint)) AS "to_warehouse",
                (SELECT * FROM rtn_element_json('63'::bigint, products::json)) AS "products",
                (SELECT * FROM rtn_element_select('54'::bigint, created_by::text, user_id::bigint)) AS "created_by",
                (SELECT * FROM rtn_element_text('64'::bigint, create_date::text)) AS "created_date",
                (SELECT * FROM rtn_element_text('44'::bigint, deliver_date::text)) AS "deliver_date",
                (SELECT * FROM rtn_element_select('55'::bigint, status::text, status_id::bigint)) AS "status",
                (SELECT * FROM rtn_element_select('56'::bigint, transfer_type::text, type_id::bigint)) AS "transfer_type",
                (SELECT * FROM rtn_element_json('48'::bigint, notes::json)) AS "notes", 
                (SELECT * FROM rtn_products_list(manufacturer_id::integer, _location::integer)) AS "productList",
                received
            FROM rtn_transfers_view(
                _limit, 
                _offset, 
                _establishment, 
                _manufacturers,
                _locations,
                _location,
                _filter
            ) 
			 ORDER BY create_date Desc
        ) tt 
    ) t
);

END;

$function$


SELECT * FROM rtn_transfers(25, 0, 0, 1, NULL);