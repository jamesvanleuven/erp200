select  
	tc.constraint_type,
	tc.constraint_name, 
	tc.constraint_schema || '.' || tc.table_name || '.' || kcu.column_name as physical_full_name,  
	tc.constraint_schema,
	tc.table_name, 
	kcu.column_name, 
	ccu.table_name as foreign_table_name, 
	ccu.column_name as foreign_column_name
FROM 
	information_schema.table_constraints as tc  
	join information_schema.key_column_usage as kcu on (tc.constraint_name = kcu.constraint_name and tc.table_name = kcu.table_name)
	join information_schema.constraint_column_usage as ccu on ccu.constraint_name = tc.constraint_name
WHERE 
	constraint_type in ('PRIMARY KEY','FOREIGN KEY')
ORDER BY 
	tc.constraint_type;
    
select 
    conrelid::regclass AS table_from, 
    conname, 
    pg_get_constraintdef(c.oid)
from   pg_constraint c
join   pg_namespace n ON n.oid = c.connamespace
where  contype in ('f', 'p','c','u') order by contype;