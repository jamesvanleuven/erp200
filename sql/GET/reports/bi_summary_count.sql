DROP FUNCTION IF EXISTS public.bi_summary_count(integer, integer, character varying, character varying);

CREATE OR REPLACE FUNCTION public.bi_summary_count(

	_limit integer
	, _offset integer
	, _filter character varying
	, _paging character varying
	
) RETURNS TABLE (
	result JSON
) LANGUAGE plpgsql AS $function$

DECLARE
	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_filter ALIAS FOR $3;
	_paging ALIAS FOR $4;
	sql character varying;
	
	BEGIN
	
	 sql := 'SELECT row_to_json(t) FROM (SELECT count(*) AS count'
		|| ' FROM (SELECT DISTINCT ON((p->>''id'')::bigint)'
		|| ' a.manufacturer_id, a.location_id, (p->>''id'')::bigint AS product_id'
		|| ', c.sku, c.name AS product, a.created, sum((p->>''quantity'')::integer) AS ordered'
		|| ' FROM pim_orders a, json_array_elements(a.products) p'
		|| ' LEFT OUTER JOIN pim_products b ON b.id = (p->>''id'')::bigint'
		|| ' LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>''id'')::bigint'
		|| ' WHERE ((p->>''id'')::bigint > 0 AND status_id IN(1,2,3)AND a.location_id NOT IN(SELECT(UNNEST(ARRAY[0]))))'
		|| ' GROUP BY 1, 2, 3, 4, 5, 6'
		|| ' ORDER BY 3) A'

		/**
		 * ORDERS NESTED-QUERY 
		 */
		|| ' LEFT OUTER JOIN (SELECT DISTINCT ON((P->> ''id'')::bigint)'
		|| ' (p->>''id'')::bigint AS product_id'
		|| ', a.manufacturer_id, a.location_id, c.name AS product'
		|| ', SUM((p->>''quantity'')::integer) AS ordered'
		|| ' FROM pim_orders a, json_array_elements(a.products) p'
		|| ' LEFT OUTER JOIN pim_products b ON b.id = (p->>''id'')::bigint'
		|| ' LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>''id'')::bigint'
		|| ' WHERE ((p->> ''id'')::bigint > 0 AND status_id NOT IN(SELECT(UNNEST(ARRAY[4])))'
		|| ' AND a.location_id NOT IN(SELECT(UNNEST(ARRAY[0]))))'
		|| ' GROUP BY 1, 2, 3, 4'
		|| ' ORDER BY 1) o ON a.product_id = o.product_id'

		/**
		 * INVENTORY NESTED-QUERY (NOT ALLOCATED) 
		 */
		|| ' LEFT JOIN (SELECT DISTINCT cc.name, bb.name, bb.product_id'
		|| ', SUM(aa.quantity) AS not_allocated FROM pim_inventory aa'
		|| ' INNER JOIN "public".pim_batch bb ON aa.product_id = bb.product_id'
		|| ' INNER JOIN "public".crm_establishments cc ON cc.id = aa.manufacturer_id'
		|| ' WHERE (aa.location_id NOT IN (SELECT(UNNEST(ARRAY[0]))))'
		|| ' GROUP BY 1, 2, 3) i ON a.product_id = i.product_id'

		/**
		 * MANUAL ADJUSTMENTS NESTED-QUERY 
		 */
		|| ' LEFT JOIN (SELECT DISTINCT (p->>''id'')::bigint AS product_id'
		|| ', c.name AS product'
		|| ', SUM((p->>''quantity'')::integer) AS ordered FROM pim_transfers a,'
		|| ' json_array_elements(a.products) p'
		|| ' LEFT OUTER JOIN pim_products b ON b.id = (p->>''id'')::bigint'
		|| ' LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>''id'')::bigint'
		|| ' WHERE (type_id = 3 AND a.to_id NOT IN (SELECT(UNNEST(ARRAY[0]))))'
		|| ' GROUP BY 1, 2'
		|| ' ORDER BY 1) m ON a.product_id = m.product_id'

		/**
		 * TRANSFERS OUT NESTED-QUERY
		 */
		|| ' LEFT JOIN (SELECT DISTINCT (p->>''id'')::bigint AS product_id'
		|| ', c.name AS product'
		|| ', SUM((p->>''quantity'')::integer) AS transfer_out'
		|| ' FROM pim_transfers a, json_array_elements(a.products) p'
		|| ' LEFT OUTER JOIN pim_products b ON b.id = (p->>''id'')::bigint'
		|| ' LEFT OUTER JOIN pim_batch c ON c.product_id = (p->>''id'')::bigint'
		|| ' WHERE (status_id NOT IN(SELECT(UNNEST(ARRAY[4])))'
		|| ' AND type_id = 1 AND a.from_id NOT IN(SELECT(UNNEST(ARRAY[0]))))'
		|| ' GROUP BY 1, 2'
		|| ' ORDER BY 1) t ON a.product_id = t.product_id'
		
		/**
		 * PARAMS ENCLOSEURE
		 */
		 || ' WHERE (';
		 
		 /**
		  * TEST FOR JANUARY OF THIS YEAR
		  */
		  IF EXTRACT(MONTH FROM now()) = 1 THEN -- IS JANUARY
		  	sql := sql || ' (EXTRACT(YEAR FROM a.created) = (EXTRACT(MONTH FROM now()) - 1)'
		  		|| ' AND EXTRACT(YEAR FROM a.created = EXTRACT(MONTH FROM now()))';
		  ELSE
		  	sql := sql || ' EXTRACT(YEAR FROM a.created) = EXTRACT(YEAR FROM now())';
		  END IF;
		  
		 /**
		  * FILTER BY USER SELECTED
		  */
		  IF _filter IS NOT NULL THEN
		  	sql := sql || _filter;
		  END IF;
		 
		 sql := sql || ')';
		 
		 /**
		  * PAGING ORDER BY PARAMS USER SELECTED
		  */
		  IF _paging IS NOT NULL THEN
		  	sql := sql || _paging;
		  END IF;
		  
		  sql := sql || ') t;';

		 
		 RETURN QUERY EXECUTE sql;
		 	
	END;
	
$function$;

SELECT * FROM public.bi_summary_count(25, 0, ' AND (DATE(a.created) >= DATE(''2017-05-01 00:00:00'') AND DATE(a.created) <= DATE(''2017-09-30 23:59:59'')) AND (a.location_id::integer NOT IN(SELECT(UNNEST(ARRAY[0]::integer[])))) AND (a.manufacturer_id::integer NOT IN(SELECT(UNNEST(ARRAY[0]::integer[]))))', NULL );