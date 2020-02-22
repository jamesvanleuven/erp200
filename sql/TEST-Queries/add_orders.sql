INSERT INTO public.pim_orders (
	user_id,
	customer_id,
	manufacturer_id,
	location_id,	
	products,
	delivery_date
) VALUES (
	'1',
	'1',
	'364',
	'1',
	'[{"id": 1, "quantity": 10, "price": 0.00},{"id": 2, "quantity": 10},{"id": 3, "quantity": 10}]',
	CURRENT_DATE + INTERVAL '3 DAY'
);


SELECT 
	a.* 
FROM pim_orders a
WHERE 
	a.manufacturer_id = '364' 
	AND
	a.location_id = '1' 
	AND
	(
		DATE(a.created) >= CURRENT_DATE 
		AND DATE(a.created) < CURRENT_DATE + INTERVAL '1 DAY'
	)
ORDER BY a.created DESC;