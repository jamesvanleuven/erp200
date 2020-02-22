-- DROP AND CREATE SCRIPT FOR ACL_TYPES
-- NOT ADDED TO V21_DEVELOPMENT BECAUSE CURRENTLY NOT USED

DROP TABLE IF EXISTS public.acl_types;
DROP SEQUENCE IF EXISTS public.acl_types_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.acl_types_id_seq START 1;
	
	CREATE TABLE IF NOT EXISTS public.acl_types (
		id bigint DEFAULT nextval('acl_types_id_seq'::regclass) NOT NULL,
		"name" character varying(255),
		editable boolean DEFAULT false NOT NULL,
		PRIMARY KEY(id)
	);
	
	-- Insert batch #1
	INSERT INTO public.acl_types (id, name, editable) VALUES
		(1, 'System', 'False'),
		(2, 'Manufacturer', 'True');

COMMIT;