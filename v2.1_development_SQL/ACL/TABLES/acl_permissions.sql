DROP TABLE IF EXISTS public.acl_permissions;
DROP SEQUENCE IF EXISTS public.acl_permissions_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.acl_permissions_id_seq START 1;
	
	CREATE TABLE IF NOT EXISTS public.acl_permissions (
		id bigint DEFAULT nextval('acl_permissions_id_seq'::regclass) NOT NULL,
		"name" character varying(255),
		description text,
		type_id bigint DEFAULT NULL,
		_get boolean DEFAULT false NOT NULL,
		_post boolean DEFAULT false NOT NULL,
		_put boolean DEFAULT false NOT NULL,
		_patch boolean DEFAULT false NOT NULL,
		_delete boolean DEFAULT false NOT NULL,
		_print boolean DEFAULT false NOT NULL,
		_sys boolean DEFAULT false NOT NULL,
		PRIMARY KEY(id)
	);
	
	-- Insert batch #1
	INSERT INTO public.acl_permissions (id, name, description, type_id, _get, _post, _put, _patch, _delete, _print, _sys) VALUES
		(1, 'System Administrator', 'Full System Access all permissions available ', 1, 'True', 'True', 'True', 'True', 'True', 'True', 'True'),
		(2, 'Administrator', 'Can POST, GET, PUT, DEL any record in this module', 1, 'True', 'True', 'True', 'True', 'True', 'True', 'False'),
		(3, 'Office Manager', 'Can POST, GET, PUT records in this module. DEL is disabled', 1, 'True', 'True', 'True', 'True', 'False', 'True', 'False'),
		(4, 'Manager', 'Can POST & GET records in this module. PUT & DEL are disabled', 1, 'True', 'True', 'True', 'False', 'False', 'True', 'False'),
		(5, 'Editor', 'Can GET & PUT records in this module. POST & DEL are disabled', 1, 'True', 'True', 'False', 'True', 'False', 'True', 'False'),
		(6, 'User', 'Can GET records in this module. POST, PUT & DEL are disabled', 1, 'True', 'False', 'True', 'True', 'False', 'True', 'False'),
		(7, 'Prohibited', 'This module disallows the POST, PUT, DEL However is still a viewable page object so _GET = True', 1, 'True', 'False', 'False', 'False', 'False', 'False', 'False');

COMMIT;

END;