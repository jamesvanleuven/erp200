CREATE OR REPLACE FUNCTION public.rtn_orders_assets(
	_establishment integer, 
	_locations integer[]
) RETURNS json LANGUAGE sql
AS $function$
	
	SELECT row_to_json(a2) 
	FROM (
			SELECT row_to_json(a3) AS "orders"
			FROM (
				SELECT 
					(SELECT * FROM rtn_product_types()) AS "product_types",
					(SELECT * FROM rtn_package_types()) AS "package_types",
					(SELECT * FROM rtn_list_locations(_locations::integer[])) AS "location",
					(SELECT * FROM rtn_list_users(ARRAY[_establishment]::integer[])) AS "created_by",
					(SELECT * FROM rtn_list_statuses(4::integer)) AS "status",
					(SELECT * FROM rtn_note_type_list_new(ARRAY[0,4]::integer[])) AS "note_types",
					(SELECT * FROM rtn_transaction_schema('pim_orders'::character varying)) AS "elements"
			) a3
	) a2;

$function$;


SELECT * FROM rtn_orders_assets(0, ARRAY[1,2,3,6,14]::integer[]);