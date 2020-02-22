DROP TABLE IF EXISTS public.cms_modules;
DROP SEQUENCE IF EXISTS public.cms_modules_id_seq;

BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.cms_modules_id_seq START 1;
CREATE TABLE IF NOT EXISTS public.cms_modules (
	id bigint DEFAULT nextval('cms_modules_id_seq'::regclass) NOT NULL,
	"name" character varying(255),
	type_id bigint DEFAULT NULL,
	created timestamp(6) without time zone DEFAULT now() NOT NULL,
	active boolean DEFAULT true NOT NULL,
	ico character varying(255) DEFAULT NULL,
	permission_id bigint DEFAULT NULL,
	module_type_id bigint DEFAULT NULL,
	PRIMARY KEY(id)
);

-- Insert batch #1
INSERT INTO public.cms_modules (id, name, type_id, created, active, ico, permission_id, module_type_id) VALUES
(1, 'Dashboard', 1, '2015-12-26 04:47:08.988644', 'True', 'fa fa-desktop', 2, 0),
(2, 'Manufacturers', 1, '2015-12-26 04:47:36.970938', 'True', 'fa fa-industry', 2, 1),
(3, 'Products', 1, '2015-12-26 04:47:38.365085', 'True', 'fa fa-beer', 2, 1),
(4, 'Orders', 1, '2015-12-26 04:47:39.880841', 'True', 'fa fa-shopping-cart', 2, 2),
(5, 'Transfers', 1, '2015-12-26 04:47:41.123839', 'True', 'fa fa-exchange', 2, 2),
(6, 'Invoices', 1, '2015-12-26 04:47:42.409604', 'True', 'fa fa-money', 2, 1),
(7, 'Users', 1, '2015-12-26 04:47:43.589248', 'True', 'fa fa-users', 2, 1),
(8, 'Reports', 1, '2015-12-26 04:47:44.844634', 'True', 'fa fa-line-chart', 2, 3),
(9, 'Routing', 1, '2015-12-26 04:47:44.844634', 'True', 'fa fa-map', 2, 1),
(10, 'Customers', 1, '2015-12-26 04:47:44.844634', 'True', 'fa fa-glass', 2, 1),
(11, 'Profile', 3, '2016-01-28 15:29:32.434438', 'True', 'fa fa-user', 2, 1),
(12, 'Settings', 3, '2016-01-28 15:30:10.563672', 'True', 'fa fa-gears', 2, 1),
(13, 'History', 2, '2016-01-28 15:30:42.191472', 'True', 'fa fa-folder-open-o', 2, 1),
(14, 'Preferences', 3, '2016-01-28 15:31:10.189253', 'True', 'fa fa-wrench', 2, 1),
(15, 'Support', 2, '2016-01-28 15:31:55.302596', 'True', 'fa fa-exclamation-triangle', 2, 1),
(16, 'Locations', 1, '2016-07-13 15:44:05.560424', 'True', 'fa fa-building', 2, 1),
(17, 'Adjustments', 4, '2016-08-10 18:35:24.218066', 'False', NULL, 2, 2),
(18, 'Returns', 4, '2016-08-10 18:36:31.434074', 'False', NULL, 2, 2),
(19, 'Empties', 4, '2016-08-10 18:36:59.02503', 'False', NULL, 2, 2);

COMMIT;

END;