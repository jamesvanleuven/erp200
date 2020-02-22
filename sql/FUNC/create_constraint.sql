ALTER TABLE <table_name> DROP CONSTRAINT "constraint_<column_name>";

ALTER TABLE <table_name> ADD CONSTRAINT "constraint_<column_name>" UNIQUE (<column_name>);