DROP FUNCTION IF EXISTS public.rtn_report_assets(
    _locations integer[]
    , _manufacturers integer[]
);

CREATE OR REPLACE FUNCTION public.rtn_report_assets(
	_locations integer[]
	, _manufacturers integer[]
)
 RETURNS json
 LANGUAGE sql
AS $function$
	
SELECT row_to_json(t) 
FROM (
    SELECT 
		(SELECT * FROM rtn_product_types()) AS "product_type"
		, (SELECT * FROM rtn_package_types()) AS "package_type"
		, (SELECT * FROM rtn_report_types()) AS report_type
		, (SELECT * FROM rtn_list_locations(_locations)) AS "warehouses"
		, (SELECT * FROM rtn_list_users(ARRAY[_manufacturers]::integer[])) AS "created_by"
		, (SELECT * FROM rtn_report_statuses(ARRAY[5]::integer[])) AS "status"
--		, (SELECT * FROM rtn_note_type_list(ARRAY[0,4,5]::integer[])) AS "note_types"
		, (SELECT * FROM rtn_list_transfer_types(5)) AS "transfer_type"
--		, (SELECT * FROM rtn_table_schema('view_report_transfers'::character varying)) AS "elements"
) t;

$function$;

SELECT * FROM rtn_report_assets(
	ARRAY[6,14,1,2,3]
	, ARRAY[377]
);

