DROP FUNCTION IF EXISTS rtn_transfers_view(
	integer
	, integer
	, integer
	, integer[]
	, integer[]
	, integer
	, character varying
);


CREATE OR REPLACE FUNCTION public.rtn_transfers_view(
	_limit integer, 
	_offset integer, 
	_establishment integer, 
	_manufacturers integer[], 
	_locations integer[], 
	_location integer, 
	_filter character varying
) RETURNS TABLE (
	id bigint, 
	transfer_id bigint, 
	user_id bigint, 
	created_by text, 
	manufacturer_id bigint, 
	manufacturer text, 
	from_id bigint, 
	from_warehouse character varying, 
	to_id bigint, 
	to_warehouse character varying, 
	products json, 
	status_id bigint, 
	status character varying, 
	type_id bigint, 
	transfer_type character varying, 
	notes json, 
	deliver_date text, 
	create_date text, 
	received boolean, 
	received_id bigint, 
	received_by text, 
	received_date text,
	pickup boolean,
	rush boolean
)
 LANGUAGE plpgsql
AS $function$
DECLARE 
    _limit ALIAS FOR $1; 
    _offset ALIAS FOR $2; 
    _establishment ALIAS FOR $3; 
    _manufacturers ALIAS FOR $4; 
    _locations ALIAS FOR $5; 
    _location ALIAS FOR $6; 
    _filter ALIAS FOR $7; 
    _startdate ALIAS FOR $8; 
    _enddate ALIAS FOR $9; 
    sql character varying; 
BEGIN 
	sql := '	SELECT a.id'; 
	sql := sql || ', a.id AS transfer_id'; 
	sql := sql || ', a.user_id'; 
	sql := sql || ', a.created_by'; 
	sql := sql || ', a.manufacturer_id'; 
	sql := sql || ', a.manufacturer'; 
	sql := sql || ', a.from_id'; 
	sql := sql || ', a.from_warehouse'; 
	sql := sql || ', a.to_id'; 
	sql := sql || ', a.to_warehouse'; 
	sql := sql || ', a.products'; 
	sql := sql || ', a.status_id'; 
	sql := sql || ', a.status'; 
	sql := sql || ', a.type_id';
	sql := sql || ', a.transfer_type';
	sql := sql || ', a.notes'; 
	sql := sql || ', to_char((a.delivery_date + interval ''1'' day) at time zone ''UTC'', ''YYYY-MM-DD"T"HH24:MI:SS"Z"'') AS "deliver_date"'; 
	sql := sql || ', to_char((a.created + interval ''1'' day) at time zone ''UTC'', ''YYYY-MM-DD"T"HH24:MI:SS"Z"'') AS "create_date"'; 
	sql := sql || ', a.received';
	sql := sql || ', a.received_id';
	sql := sql || ', a.received_by';
	sql := sql || ', to_char((a.received_date + interval ''1'' day) at time zone ''UTC'', ''YYYY-MM-DD"T"HH24:MI:SS"Z"'') AS "received_date"';,
	sql := sql || ', a.pickup, a.rush'
	sql := sql || ' FROM matview_transfers a WHERE '; 
	sql := sql || ' (a.from_id = ''' || _location || ''' OR a.to_id = ''' || _location || ''')'; 
    IF _establishment > 0 THEN 
			sql := sql || ' AND a.manufacturer_id = ''' || _establishment || ''''; 
		END IF; 

    IF _filter IS NOT NULL THEN
        sql := sql || ' ' 
            || _filter
            || ' ORDER BY a.created Desc OFFSET '
						|| _offset
            || ' FETCH NEXT '
            || _limit
            || ' ROWS ONLY;';
    ELSE
        sql := sql || ' ORDER BY a.created Desc OFFSET '
            || _offset
            || ' FETCH NEXT '
            || _limit
            || ' ROWS ONLY;';
    END IF;
    
    RETURN QUERY EXECUTE sql; 
END; 
$function$;

SELECT * FROM rtn_transfers_view(
	10
	, 0 
	, 0
	, ARRAY[]::integer[]
	, ARRAY[]::integer[]
	, 1
	, NULL
);