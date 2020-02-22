DO $$

DECLARE 
	_fname character varying := 'John'; -- First name
	_lname character varying := 'Smith'; 
	_domain character varying := 'directtap.com'; -- domain name
	_eml character varying := LOWER(_fname) || '.' || LOWER(_lname) || '@' || LOWER(_domain);
	_pwd character varying := LOWER(_fname) || LOWER(_lname) || '#1';
	_uid integer; -- user id
	_lid integer; -- login id
	_locations integer[] := ARRAY[1,2,3,4]; -- locations
	_modules integer[] := ARRAY[1,2,16,3,4,5,8,10]; -- modules
	_ins_i integer; -- loop counter
	
	BEGIN
	
		INSERT INTO crm_users (
			firstname
			, lastname
			, active
			, establishment_id
			, locations
			, manufacturers
		) VALUES (
			_fname
			, _lname
			, true
			, 0
			, _locations
			, _modules
		) RETURNING id INTO _uid;
		
		INSERT INTO acl_login (
			usr
			, pwd
			, active
			, usr_id
		) VALUES (
			_eml
			, _pwd
			, true
			, _uid
		) RETURNING id INTO _lid;
		
		INSERT INTO acl_credentials (
			user_id
			, login_id
			, group_id
			, role_id
			, modules
			, location
		) VALUES (
			_uid
			, _lid
			, 1
			, 4
			, _modules
			, _locations
		);
		
		FOREACH _ins_i IN ARRAY _locations 
		LOOP
		
			INSERT INTO acl_location_modules (
				usr_id
				, location_id
				, modules
			) VALUES (
				_uid
				, _ins_i
				, _modules
			);
		
		END LOOP;
		
		RETURN;
	
END $$;

SELECT * FROM acl_login ORDER BY id Desc LIMIT 20;
SELECT * FROM crm_users ORDER BY id Desc LIMIT 20;
SELECT * FROM acl_credentials ORDER BY id Desc LIMIT 20;
SELECT * FROM acl_location_modules WHERE location_id = 1 ORDER BY id Desc LIMIT 20;