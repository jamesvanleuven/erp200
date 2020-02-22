-- return all warehouses
SELECT
	b.id AS manufacturer_id,
	b.warehouse_id,
	a.name AS warehouse
FROM
	(
		SELECT
			id,
			unnest(location_id) AS warehouse_id
		FROM crm_establishments 
		WHERE id = '228'
	) b
RIGHT OUTER JOIN crm_locations a ON b.warehouse_id = a.id;
-- WHERE b.warehouse_id = '1';

-- does home warehouse exist
select a.location_id::int[] @> ARRAY['4'::integer] AS hwh
FROM crm_establishments a
WHERE a.id = '228';

-- does home warehouse exists using ANY >> AVOID LIKE THE PLAGUE
SELECT '4' = ANY(a.location_id::integer[]) AS hwh 
FROM crm_establishments a 
WHERE a.id = '228';