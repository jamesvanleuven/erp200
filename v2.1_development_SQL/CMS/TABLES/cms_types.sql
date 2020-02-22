DROP TABLE IF EXISTS public.cms_types;
DROP SEQUENCE IF EXISTS public.cms_type_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.cms_type_id_seq START 1;
	CREATE TABLE IF NOT EXISTS public.cms_types (
		id bigint DEFAULT nextval('cms_type_id_seq'::regclass) NOT NULL,
		"name" character varying(255) DEFAULT NULL::character varying,
		label character varying(255) DEFAULT NULL::character varying, -- label column designed to replace 'name' column
		PRIMARY KEY(id)
	);
	
	-- Insert batch #1
	INSERT INTO public.cms_types (id, name, label) VALUES
		(1, 'Application', 'Application'),
		(2, 'System', 'System'),
		(3, 'User', 'User'),
		(4, 'Section', 'Section');

COMMIT;

END;