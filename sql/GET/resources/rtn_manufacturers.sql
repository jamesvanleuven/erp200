<<<<<<< HEAD
CREATE OR REPLACE FUNCTION public.rtn_manufacturers(_limit integer, _offset integer, _filter character varying)
 RETURNS TABLE(result json)
=======
DROP FUNCTION IF EXISTS rtn_manufacturers(
	integer
	, integer
	, character varying
);

CREATE OR REPLACE FUNCTION public.rtn_manufacturers(
	_limit integer
	, _offset integer
	, _filter character varying
) RETURNS TABLE(result json)
>>>>>>> features/transaction-filters
 LANGUAGE plpgsql
AS $function$ 

DECLARE 
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_filter ALIAS FOR $3;
	sql character varying;

BEGIN

    sql := 'SELECT array_to_json(array_agg(row_to_json(t))) FROM ( SELECT'
		|| ' a.id, a.key AS "channel",'
<<<<<<< HEAD
		|| ' (SELECT * FROM rtn_element_integer(72::bigint, a.store_number::integer)) AS store_number,'
		|| ' (SELECT * FROM rtn_element_integer(''1''::bigint,a.license_number::integer)) AS "license_number",'
		|| ' (SELECT * FROM rtn_element_text(''2''::bigint,a.manufacturers::text)) AS "manufacturers",'
		|| ' (SELECT * FROM rtn_element_select(''3''::bigint, a.establishment_types::text, a.establishment_type_id::bigint) ) AS "establishment_types",'
		|| ' (SELECT * FROM rtn_element_select(''4''::bigint, a.license_types::text, a.license_type_id::bigint) ) AS "license_types",'
		|| ' (SELECT * FROM rtn_element_select(''5''::bigint, a.license_sub_types::text, a.license_sub_type_id::bigint) ) AS "license_sub_types",'
		|| ' (SELECT * FROM rtn_element_text(66::bigint, a.address::text)) AS address,'
		-- FULL ADDRESS
		|| ' (SELECT row_to_json(t) FROM (SELECT'
		|| ' (SELECT row_to_json(s) FROM (SELECT aa.address_id AS id, aa.street AS value) s) AS street'
		|| ', (SELECT row_to_json(c) FROM (SELECT aa.city_id AS id, aa.city AS value) c) AS city'
		|| ', (SELECT row_to_json(p) FROM (SELECT aa.state_id AS id, aa.state AS value) p) AS province'
		|| ', aa.zipcode FROM matview_manufacturers aa WHERE aa.id = a.id) t) AS full_address,'
		|| ' (SELECT * FROM rtn_element_boolean(80::bigint, a.auto_invoicing::boolean)) AS auto_invoicing,'
=======
		|| ' (SELECT * FROM rtn_element_integer(1::bigint,a.license_number::integer)) AS "license_number",'
		|| ' (SELECT * FROM rtn_element_text(2::bigint,a.manufacturers::text)) AS "manufacturers",'
		|| ' (SELECT * FROM rtn_element_integer(72::bigint, a.store_number::integer)) AS store_number,'
		-- ADDRESS  CONCAT
		|| ' (SELECT * FROM rtn_element_text(6::bigint, a.address::text)) AS address,'
		-- FULL ADDRESS OBJECT
		|| ' (SELECT row_to_json(tt) FROM (SELECT a.zipcode,'
		|| ' (SELECT row_to_json (ss) FROM (SELECT a.address_id AS id, a.street AS value) ss) AS street,'
		|| ' (SELECT row_to_json (cc) FROM (SELECT a.city_id AS id, a.city AS value) cc) AS city,'
		|| ' (SELECT row_to_json(pp) FROM (SELECT a.state_id AS id, a.state AS value) pp) AS province) tt) AS full_address,'
		-- ASSIGNMENT TYPES
		|| ' (SELECT * FROM rtn_element_select(3::bigint, a.establishment_types::text, a.establishment_type_id::bigint) ) AS "establishment_types",'
		|| ' (SELECT * FROM rtn_element_select(4::bigint, a.license_types::text, a.license_type_id::bigint) ) AS "license_types",'
		|| ' (SELECT * FROM rtn_element_select(5::bigint, a.license_sub_types::text, a.license_sub_type_id::bigint) ) AS "license_sub_types",'
		
		|| ' (SELECT * FROM rtn_element_boolean(82::bigint, a.auto_invoicing::boolean)) AS auto_invoicing,'
>>>>>>> features/transaction-filters
		|| ' (SELECT * FROM rtn_element_text(67::bigint, a.opens::text)) AS opens_at,'
		|| ' (SELECT * FROM rtn_element_text(68::bigint, a.closes::text)) AS closes_at,'
		|| ' (SELECT * FROM rtn_element_json(69::bigint, a.delivery_days::json)) AS delivery_days,'
		|| ' (SELECT * FROM rtn_element_json(70::bigint, a.notes::json)) AS notes,'
		|| ' a.created, a.active FROM matview_manufacturers a WHERE a.active = true';

    IF _filter IS NOT NULL THEN
        sql := sql || ' ' 
            || _filter
            || ' ORDER BY a.created Desc OFFSET '
						|| _offset
            || ' FETCH NEXT '
            || _limit
            || ' ROWS ONLY) t;';
    ELSE
        sql := sql || ' ORDER BY a.created Desc OFFSET '
            || _offset
            || ' FETCH NEXT '
            || _limit
            || ' ROWS ONLY) t;';
    END IF;

    RETURN QUERY EXECUTE sql;

END;

$function$;

<<<<<<< HEAD
SELECT * FROM rtn_manufacturers(1,0,NULL);
=======

SELECT * FROM rtn_manufacturers(25, 0, 1, null);
>>>>>>> features/transaction-filters
