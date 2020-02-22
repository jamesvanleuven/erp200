DROP TABLE IF EXISTS public.acl_roles;
DROP SEQUENCE IF EXISTS public.acl_roles_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.acl_roles_id_seq START 1;
	CREATE TABLE IF NOT EXISTS public.acl_roles (
		id bigint DEFAULT nextval('acl_roles_id_seq'::regclass) NOT NULL,
		permission_id bigint DEFAULT 0 NOT NULL,
		"name" character varying(255),
		type_id bigint DEFAULT NULL,
		modules integer[] DEFAULT '{}'::integer[] NOT NULL,
		PRIMARY KEY(id)
	);
	
	-- Insert batch #1
	INSERT INTO public.acl_roles (id, permission_id, name, type_id, modules) VALUES
		(1, 1, 'System Administrator', 1, '{}'),
		(2, 2, 'Administrator', 2, '{}'),
		(3, 1, 'Developer', 1, '{}'),
		(4, 2, 'Order Desk', 1, '{}');

COMMIT;

END;