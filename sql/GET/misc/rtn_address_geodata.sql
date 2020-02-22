-- SELECT * FROM sys_addresses LIMIT 100;


select 
	a.id,
	a.street,
	b.township, 
	( select content from rtn_geodata(a.street || ', ' || b.township)) AS remote_geodata 
from sys_addresses a 
right outer join sys_municipalities b on b.id = a.city_id LIMIT 50;