-- TRUNCATE aaa_ordernumbers;

-- SELECT * FROM aaa_ordernumbers_20170915 LIMIT 100;
-- SELECT * FROM aaa_ordernumbers_20170915 WHERE order_number IS NOT NULL;

select count(*) from orders where order_number = 'PO19449';
select 
	id
	, customer_id AS customer_number
	, order_number
	, NULL AS doc_60
	, created
from orders WHERE order_number = 'PO19449';
/*
update orders 
set order_number = a.order_number
from aaa_ordernumbers_20170915 a
where 
	orders.id = a.id  
	AND orders.order_number = 'PO19449';
*/
select count(*) from aaa_ordernumbers_20170915 where order_number is not null;
