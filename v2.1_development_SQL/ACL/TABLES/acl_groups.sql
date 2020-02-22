DROP TABLE IF EXISTS public.acl_groups;
DROP SEQUENCE IF EXISTS public.acl_groups_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.acl_groups_id_seq START 1;
	CREATE TABLE IF NOT EXISTS public.acl_groups (
		id bigint DEFAULT nextval('acl_groups_id_seq'::regclass) NOT NULL,
		permission_id bigint DEFAULT NULL,
		"name" character varying(255) DEFAULT NULL,
		type_id bigint DEFAULT NULL,
		roles integer[] DEFAULT '{}'::integer[] NOT NULL,
		PRIMARY KEY(id)
	);

-- Insert batch #1
INSERT INTO public.acl_groups (id, permission_id, name, type_id, roles) VALUES
(3, 0, 'Suppliers', 0, '{}'),
(6, 0, 'Retailers', 0, '{}'),
(1, 1, 'System', 1, '{1,2,3,4}'),
(5, 2, 'Distributors', 0, '{2,3,4}'),
(2, 2, 'Manufacturers', 1, '{2,3,4}');

COMMIT;

END;