DROP TABLE IF EXISTS public.acl_module_permissions;
DROP SEQUENCE IF EXISTS public.acl_module_permissions_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.acl_module_permissions_id_seq START 1;
	
	CREATE TABLE IF NOT EXISTS public.acl_module_permissions (
		id bigint DEFAULT nextval('acl_module_permissions_id_seq'::regclass) NOT NULL,
		assignment_id bigint DEFAULT 0 NOT NULL,
		permission_id bigint DEFAULT 0 NOT NULL,
		PRIMARY KEY(id)
	);
	
-- Insert batch #1
	INSERT INTO public.acl_module_permissions (id, assignment_id, permission_id) VALUES
		(1, 1, 1),
		(2, 2, 1),
		(3, 3, 1),
		(4, 4, 1),
		(5, 5, 1),
		(6, 6, 1),
		(7, 7, 1),
		(8, 8, 1),
		(9, 9, 1),
		(10, 10, 1),
		(11, 16, 1),
		(12, 1, 2),
		(13, 2, 2),
		(14, 3, 2),
		(15, 4, 2),
		(16, 5, 2),
		(17, 6, 2),
		(18, 7, 2),
		(19, 8, 2),
		(20, 9, 2),
		(21, 10, 2),
		(22, 16, 2);

COMMIT;

END;