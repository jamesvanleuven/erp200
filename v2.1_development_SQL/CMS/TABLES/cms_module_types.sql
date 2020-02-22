DROP TABLE IF EXISTS public.cms_module_types;
DROP SEQUENCE IF EXISTS public.cms_module_types_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.cms_module_types_id_seq START 1; -- SEQUENCE
	CREATE TABLE IF NOT EXISTS public.cms_module_types ( -- TABLE
		id bigint DEFAULT nextval('cms_module_types_id_seq'::regclass) NOT NULL,
		"name" character varying(255),
		PRIMARY KEY(id)
	);
	
	-- Insert batch #1
	INSERT INTO public.cms_module_types (id, name) VALUES
		(1, 'resources'),
		(2, 'transactions'),
		(3, 'reports'),
		(4, 'system');

COMMIT;

END;