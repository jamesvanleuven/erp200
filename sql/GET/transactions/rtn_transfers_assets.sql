	-- DEVELOPMENT
CREATE OR REPLACE FUNCTION public.rtn_transfers_assets(

	_establishment integer, 
	_manufacturers integer[], 
	_locations integer[], 
	_location integer
	
)
 RETURNS json
 LANGUAGE sql
AS $function$
	
SELECT row_to_json(t) 
FROM (
    SELECT row_to_json(tt) AS "transfers"
    FROM (
        SELECT 
            (SELECT * FROM rtn_product_types()) AS "product_type",
            (SELECT * FROM rtn_package_types()) AS "package_type",
            (SELECT * FROM rtn_list_locations(_locations::integer[])) AS "from_warehouse",
            (SELECT * FROM rtn_list_locations(_locations::integer[])) AS "to_warehouse",
            (SELECT * FROM rtn_list_users(ARRAY[_establishment]::integer[])) AS "created_by",
            (SELECT * FROM rtn_list_statuses(5)) AS "status",
			(SELECT * FROM rtn_note_type_list(ARRAY[0,5]::integer[])) AS "note_types",
            (SELECT * FROM rtn_list_transfer_types(5)) AS "transfer_type",
            (SELECT * FROM rtn_transaction_schema('pim_transfers'::character varying)) AS "elements"
    ) tt
) t;

$function$;

/*
	-- PRODUCTION

CREATE OR REPLACE FUNCTION public.rtn_transfers_assets(
	_customers integer[], 
	_establishment integer, 
	_manufacturers integer[], 
	_locations integer[], 
	_location integer
) RETURNS json 
LANGUAGE sql
AS $function$
	
SELECT row_to_json(a2) 
FROM (
    SELECT row_to_json(a3) AS "transfers"
    FROM (
        SELECT 
			(SELECT * FROM rtn_product_types()) AS "product_type",
			(SELECT * FROM rtn_package_types()) AS "package_type",
			(SELECT * FROM rtn_list_locations(_locations::integer[])) AS "from_warehouse",
			(SELECT * FROM rtn_list_locations(_locations::integer[])) AS "to_warehouse",
			(SELECT * FROM rtn_list_users(ARRAY[_establishment]::integer[])) AS "created_by",
			(SELECT * FROM rtn_list_statuses(5)) AS "status",
			(SELECT * FROM rtn_note_type_list_new(ARRAY[0,5]::integer[])) AS "note_types",
			(SELECT * FROM rtn_list_transfer_types(5)) AS "transfer_type",
			(SELECT * FROM rtn_transaction_schema('pim_transfers'::character varying)) AS "elements"
    ) a3
) a2;

$function$;

SELECT * FROM rtn_transfers_assets(
	ARRAY[]::integer[]
	, 0
	, ARRAY[]::integer[]
	, ARRAY[]::integer[]
	, 1::integer
);

*/

SELECT * FROM rtn_transfers_assets(377, ARRAY[]::integer[], ARRAY[1,2,3]::integer[], 1);