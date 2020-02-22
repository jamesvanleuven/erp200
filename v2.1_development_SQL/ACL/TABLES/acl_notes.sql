-- DROP AND CREATE SCRIPT
-- THIS TABLE IS UN-USED SO I DIDN'T CREATE IT

DROP TABLE IF EXISTS public.acl_notes;
DROP SEQUENCE IF EXISTS public.acl_notes_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.acl_notes_id_seq START 1;
	
	CREATE TABLE IF NOT EXISTS public.acl_notes (
		id bigint DEFAULT nextval('acl_notes_id_seq'::regclass) NOT NULL,
		thread_id bigint DEFAULT 0NULL,
		title character varying(100) DEFAULT now() NOT NULL,
		details text DEFAULT NULL,
		user_id bigint DEFAULT NULL,
		PRIMARY KEY(id)
	);

COMMIT;