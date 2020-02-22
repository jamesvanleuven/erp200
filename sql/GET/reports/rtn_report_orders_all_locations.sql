CREATE OR REPLACE FUNCTION public.rtn_report_orders_all_locations(
	_limit integer
	, _offset integer
	, _locations integer[]
	, _manufacturers integer[]
	, _filter character varying
)
 RETURNS TABLE(orders json)
 LANGUAGE plpgsql
AS $function$

DECLARE 

	_limit ALIAS FOR $1;
	_offset ALIAS FOR $2;
	_locations ALIAS FOR $3;
	_manufacturers ALIAS FOR $4;
	_filter ALIAS FOR $5;
	sql character varying;
	
	BEGIN
	
		sql := 'SELECT array_to_json(array_agg(row_to_json(t)))'
			|| ' FROM (SELECT'
			|| ' a.id AS order_id'
			|| ', a.udf_reference AS "Invoice Number"'
			|| ', a.customer_id'
			|| ', (SELECT x.customers FROM matview_customers x WHERE'
			|| ' x.id = a.customer_id) AS "customer"'
			|| ', d.manufacturer_id'
			|| ', ( SELECT x.manufacturers FROM matview_manufacturers x WHERE'
			|| ' x.id = d.manufacturer_id ) AS "manufacturer"'
			|| ', d.location_id'
			|| ', (SELECT x.name FROM matview_locations x WHERE'
			|| ' x.id = d.location_id) AS "location"'
			|| ', b.sku'
			|| ', b.name AS "product"'
			|| ', b.litres_per_bottle'
			|| ', b.litter_rate'
			|| ', ((p.value ->> ''quantity''::text))::integer AS "quantity"'
			|| ', ((p.value ->> ''price''::text))::numeric(10,2) AS "price"'
			|| ', ((p->>''calculatedPrice'')::text)::numeric(10,2) AS "Case Total"'
			|| ', ((p->>''quantity''::text)::integer * (p->>''calculatedPrice''::text)::decimal(10,2)) as "Total"'
			|| ', a.delivery_date'
			|| ', a.created'
			|| ' FROM pim_orders a, ((LATERAL json_array_elements(a.products) p(value)'
			|| ' LEFT JOIN pim_batch b ON ((b.product_id = ((p.value ->> ''id''::text))::bigint)))'
			|| ' LEFT JOIN pim_products c ON ((c.id = b.product_id)))'
			|| ' LEFT JOIN pim_inventory d ON ((d.product_id = b.product_id))'
			|| ' WHERE ((a.status_id IN(1,2,3))'; 
			
		IF array_length(_locations, 1) > 0 THEN
			sql := sql || 'AND (d.location_id IN(SELECT(UNNEST(ARRAY['
				|| quote_literal(_locations::integer[])
				|| '::integer[]]))))';
		END IF;
		
		IF array_length(_manufacturers, 1) > 0 THEN 
			sql := sql || ' AND (d.manufacturer_id IN(SELECT(UNNEST(ARRAY['
				|| quote_literal(_manufacturers::integer[]) 
				|| '::integer[]]))))';
		END IF;
			
		IF _filter IS NOT NULL THEN
		    sql := sql || _filter
		    	|| ') ORDER BY a.created Desc'
		    	|| ', d.location_id Asc'
		    	|| ', d.manufacturer_id Asc';
		ELSE
		    sql := sql || ') ORDER BY'
		    	|| ' a.created Desc'
		    	|| ', d.location_id Asc'
		    	|| ', d.manufacturer_id Asc';
		END IF;
		
		IF _limit IS NOT NULL OR _limit > 0 THEN
			sql := sql || ' OFFSET '
				|| _offset
				|| ' FETCH NEXT '
				|| _limit
				|| ' ROWS ONLY) t;';
		ELSE 
			sql := sql || ') t;';
		END IF;
		
		RETURN QUERY EXECUTE sql;
	
	END;

$function$
