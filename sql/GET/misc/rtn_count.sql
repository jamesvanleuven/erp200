/*******************************************************************
 *	***** INTERNAL USE ONLY - DO NOT MAKE CLIENT FACING AT ALL *****
 *******************************************************************
 *	DYNAMIC RECORDSET COUNT
 *	James Mendham <james.mendham@freshtap.com>
 *	Created: 2016-02-08 21:14:34
 *
 *	Details:
 * 	This is a dynamic method of counting total available records
 *	for internal queries so we can managing page etc
 *	Paramater Structure
 *	_table character varying > Table/View for the parent query
 *	_filter character varying > Filter for the parent query
 *******************************************************************
 */


CREATE OR REPLACE FUNCTION public.rtn_count(_table character varying, _filter character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
 v text;
BEGIN
      EXECUTE 'select count(*) FROM ' || _table || ' WHERE ' || _filter INTO v;
      RETURN v;
END;
$function$;

SELECT rtn_count('public.view_manufacturers','license_sub_type_id=11;') AS rowCount;
