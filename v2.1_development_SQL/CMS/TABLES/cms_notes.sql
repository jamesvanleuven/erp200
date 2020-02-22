-- DROP CREATE SCRIPT CMS_NOTES
-- THIS TABLE ISN'T USED SO I DIDN'T RUN IT

DROP TABLE IF EXISTS public.cms_notes;
DROP SEQUENCE IF EXISTS public.cms_notes_id_seq;

BEGIN;

	CREATE SEQUENCE IF NOT EXISTS public.cms_notes_id_seq START 1;
	CREATE TABLE IF NOT EXISTS public.cms_notes (
		id bigint DEFAULT nextval('cms_notes_id_seq'::regclass) NOT NULL,
		thread_id bigint DEFAULT 0 NOT NULL,
		user_id bigint DEFAULT 0 NOT NULL,
		title character varying(100) DEFAULT now() NOT NULL,
		details text DEFAULT 'No Note Entered'::text NOT NULL,
		PRIMARY KEY(id)
	);

COMMIT;

END;