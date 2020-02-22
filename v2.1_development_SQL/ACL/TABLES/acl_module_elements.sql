DROP TABLE IF EXISTS public.acl_module_elements;
DROP SEQUENCE IF EXISTS public.acl_module_elements_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.acl_module_elements_id_seq START 1;
	
	CREATE TABLE IF NOT EXISTS public.acl_module_elements (
		id integer DEFAULT nextval('acl_module_elements_id_seq'::regclass) NOT NULL,
		user_id integer DEFAULT NULL,
		module_id integer DEFAULT NULL,
		elements integer[] DEFAULT '{}'::integer[] NOT NULL,
		PRIMARY KEY(id)
	);
	
	-- Insert batch #1
	INSERT INTO public.acl_module_elements (id, user_id, module_id, elements) VALUES
		(1, 1, 2, '{1,7,2,3,4,5,6,8}'),
		(2, 1, 10, '{1,7,9,3,4,5,6,8}');

COMMIT;