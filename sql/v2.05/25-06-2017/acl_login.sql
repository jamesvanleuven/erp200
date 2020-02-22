TRUNCATE TABLE acl_login RESTART IDENTITY;

-- Insert batch #1
INSERT INTO public.acl_login (id, usr, pwd, pwd_hash, token, active, timestamp, usr_id) VALUES
(1, 'DT', 'admin', NULL, NULL, 'True', '2015-12-23 00:54:52.354492', 14),
(2, 'phil.gray@directtap.com', '55dunlevy', NULL, NULL, 'True', '2015-12-23 00:55:26.241931', 7),
(3, 'mackenzie.magnolo@directtap.com', 'mackenzie#1', NULL, NULL, 'True', '2016-01-18 15:38:11.677859', 8),
(6, 'brianne.carson@directtap.com', 'brianne#1', NULL, NULL, 'True', '2016-01-18 15:41:41.965652', 9),
(7, 'ryan.clark@directtap.com', 'DTROCKS', NULL, NULL, 'True', '2016-01-28 15:06:08.481625', 10),
(8, 'tyler@northamgroup.com', 'Beer1234', NULL, NULL, 'True', '2016-06-22 22:11:01.94668', 11),
(9, 'Tyler@lonetree', 'Cider1234', NULL, NULL, 'False', '2016-08-29 21:42:41.387379', 12),
(10, 'lauren.makin@directtap.com', 'lauren#1', NULL, NULL, 'True', '2016-08-29 21:48:59.354371', 13),
(11, 'james.mendham@directtap.com', 'Whsqs1c7#1', NULL, NULL, 'True', '2016-12-06 13:33:15.300421', 1),
(12, 'macaloney@directtap.com', 'macaloney#1', NULL, NULL, 'True', '2017-03-06 21:42:56.779461', 15),
(13, 'stacey@macaloneydistillers.com', 'macaloney', NULL, NULL, 'True', '2017-05-10 15:27:57.778303', 16),
(14, 'sonya@northamgroup.com', 'whistlerlonetree', NULL, NULL, 'True', '2017-05-10 15:28:19.405759', 17),
(15, 'SONYA@LONETREE', 'whistlerlonetree', NULL, NULL, 'False', '2017-05-10 15:29:50.898686', 18),
(16, 'simone@northamgroup.com', 'northam1234', NULL, NULL, 'True', '2017-05-10 17:26:17.79069', 19),
(17, 'kara@northamgroup.com', 'B1@ckTusk', NULL, NULL, 'True', '2017-05-10 17:48:16.964756', 20),
(18, 'kelsey@settlementbuilding.com', '55dunlevy', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 21),
(19, 'ozzie@postmarkbrewing.com', '55dunlevy', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 22),
(20, 'user_3@postmark.com', 'postmark#3', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 23),
(21, 'user_4@postmark.com', 'postmark#1', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 24),
(22, 'user_5@postmark.com', 'postmark#1', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 25),
(23, 'sara@thebeerfarm.ca', 'B33rFarm', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 26),
(24, 'user_2@persephone.com', 'persephone#2', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 27),
(25, 'user_3@persephone.com', 'persephone#3', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 28),
(26, 'user_4@persephone.com', 'persephone#4', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 29),
(27, 'user_5@persephone.com', 'persephone#5', NULL, NULL, 'True', '2017-06-10 23:06:23.054957', 30),
(39, 'marnitz.kotze@directtap.com', 'DT8385!', NULL, NULL, 'True', '2017-06-13 12:36:27.5988', 42),
(40, 'dennis.slater@directtap.com', '8385Fraser', NULL, NULL, 'True', '2017-06-13 12:37:01.989027', 43),
(41, 'orders@ibdistributorsltd.ca', 'beerwinecider', NULL, NULL, 'True', '2017-06-13 12:37:07.175703', 44),
(42, 'summerland@directtap.com', 'DT2017#', NULL, NULL, 'True', '2017-06-13 12:37:11.683339', 45),
(43, 'brandon.furler@directtap.com ', 'BeerCiderWine', NULL, NULL, 'True', '2017-06-13 12:37:16.710006', 46),
(44, 'Colin.Bernier@directtap.com', '8385Fraser', NULL, NULL, 'True', '2017-06-13 12:37:22.559119', 47),
(47, 'kian.serna@directtap.com', 'horseshoetoast', NULL, NULL, 'True', '2017-06-13 12:37:37.292289', 50),
(48, 'chris.allan@directtap.com', '8385Fraser', NULL, NULL, 'True', '2017-06-13 12:37:44.687171', 51),
(49, 'usr_11@directtap.com', 'usr_11#1', NULL, NULL, 'True', '2017-06-13 12:37:50.143379', 52),
(50, 'usr_12@directtap.com', 'usr_12#1', NULL, NULL, 'True', '2017-06-13 12:37:55.19978', 53),
(51, 'usr_13@directtap.com', 'usr_13#1', NULL, NULL, 'True', '2017-06-13 12:40:45.538357', 54),
(52, 'usr_14@directtap.com', 'usr_14#1', NULL, NULL, 'True', '2017-06-13 12:40:52.355524', 55),
(53, 'usr_15@directtap.com', 'usr_15#1', NULL, NULL, 'True', '2017-06-13 12:40:55.415461', 56),
(54, 'usr_17@directtap.com', 'usr_17#1', NULL, NULL, 'True', '2017-06-13 12:40:58.383829', 57),
(55, 'usr_18@directtap.com', 'usr_18#1', NULL, NULL, 'True', '2017-06-13 12:41:01.145848', 58),
(56, 'usr_19@directtap.com', 'usr_19#1', NULL, NULL, 'True', '2017-06-13 12:41:04.111201', 59),
(57, 'usr_20@directtap.com', 'usr_20#1', NULL, NULL, 'True', '2017-06-13 12:41:09.49132', 60),
(58, 'usr_21@directtap.com', 'usr_21#1', NULL, NULL, 'True', '2017-06-13 12:41:26.356334', 61);

-- RESET ESTABLISHMENTS PK AND SEQUENCE COUNT
SELECT MAX(id) acl_login_max_id FROM acl_login;
SELECT nextval('acl_login_id_seq') AS acl_login_nextval;
SELECT setval('acl_login_id_seq', (SELECT MAX(id) FROM acl_login)) AS acl_login_setval;
SELECT setval('acl_login_id_seq', COALESCE((SELECT MAX(id)+1 FROM acl_login), 1), false) AS acl_login_val;