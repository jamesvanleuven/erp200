TRUNCATE TABLE acl_credentials RESTART IDENTITY;

-- Insert batch #1
INSERT INTO public.acl_credentials (id, user_id, login_id, group_id, role_id, modules, location, note_id) VALUES
(1, 1, 1, 1, 1, '{1,2,16,3,4,5,8,10}', '{1,2,3,4,5,6,7,13,14,15}', 0),
(2, 7, 2, 1, 1, '{1,2,16,3,4,5,8,10}', '{1,2,3,4,5,6,7,13,14,15}', 0),
(10, 8, 3, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4,5,6,7,13,14,15}', 0),
(11, 9, 6, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4,5,6,7,13,14,15}', 0),
(12, 10, 7, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4,5,6,7,13,14,15}', 0),
(13, 11, 8, 2, 2, '{1,16,3,4,5,10,8}', '{6,14,1,2,3}', 0),
(14, 12, 9, 2, 2, '{1,16,3,4,5,10,8}', '{6,14,1,2,3}', 0),
(15, 13, 10, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4,5,6,7,13,14,15}', 0),
(16, 14, 1, 5, 2, '{1,2,16,3,4,5,8,10}', '{1,2,3}', 0),
(17, 15, 12, 2, 2, '{1,16,3,4,5,10,8}', '{13,1,2,3}', 0),
(18, 16, 13, 2, 2, '{1,16,3,4,5,10,8}', '{13,1,2,3}', 0),
(19, 19, 16, 2, 2, '{1,16,3,4,5,10,8}', '{6,14,1,2,3}', 0),
(20, 20, 17, 2, 2, '{1,16,3,4,5,10,8}', '{14,6,1,2,3}', 0),
(21, 17, 14, 2, 2, '{1,16,3,4,5,10,8}', '{6,14,1,2,3}', 0),
(22, 18, 15, 2, 2, '{1,16,3,4,5,10,8}', '{6,14,1,2,3}', 0),
(23, 21, 18, 2, 4, '{1,3,4,5,8}', '{5,1,2,3}', 0),
(24, 22, 19, 2, 4, '{1,3,4,5,8}', '{5,1,2,3}', 0),
(25, 23, 20, 2, 4, '{1,3,4,5,8}', '{5,1,2,3}', 0),
(26, 24, 21, 2, 4, '{1,3,4,5,8}', '{5,1,2,3}', 0),
(27, 25, 22, 2, 4, '{1,3,4,5,8}', '{5,1,2,3}', 0),
(28, 26, 23, 2, 4, '{1,3,4,5,8}', '{22,1,2,3}', 0),
(29, 27, 24, 2, 4, '{1,3,4,5,8}', '{22,1,2,3}', 0),
(30, 28, 25, 2, 4, '{1,3,4,5,8}', '{22,1,2,3}', 0),
(31, 29, 26, 2, 4, '{1,3,4,5,8}', '{22,1,2,3}', 0),
(32, 30, 27, 2, 4, '{1,3,4,5,8}', '{22,1,2,3}', 0),
(44, 42, 39, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(45, 43, 40, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(46, 44, 41, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(47, 45, 42, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(48, 46, 43, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(49, 47, 44, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(52, 50, 47, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(53, 51, 48, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(54, 52, 49, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(55, 53, 50, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(56, 54, 51, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(57, 55, 52, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(58, 56, 53, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(59, 57, 54, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(60, 58, 55, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(62, 60, 57, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(63, 61, 58, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0),
(64, 62, 59, 1, 4, '{1,2,16,3,4,5,8,10}', '{1,2,3,4}', 0);

-- RESET ESTABLISHMENTS PK AND SEQUENCE COUNT
SELECT MAX(id) acl_credentials_max_id FROM acl_credentials;
SELECT nextval('acl_credentials_id_seq') AS acl_credentials_nextval;
SELECT setval('acl_credentials_id_seq', (SELECT MAX(id) FROM acl_credentials)) AS acl_credentials_setval;
SELECT setval('acl_credentials_id_seq', COALESCE((SELECT MAX(id)+1 FROM acl_credentials), 1), false) AS acl_credentials_val;