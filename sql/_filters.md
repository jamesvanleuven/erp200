### FILTER METHOD
#
#   TEST DATATYPE : 
#       IF BIGINT, INT, FLOAT, MONEY, NUMERIC THEN
#           ' AND CAST(a.<columnName> AS TEXT) LIKE ''12345%'' ' = starts with
#           ' AND CAST(a.<columnName> AS TEXT) LIKE ''%12345%'' ' = contains
#           ' AND CAST(a.<columnName> AS TEXT) LIKE ''%12345'' ' = ends with
#           ' AND CAST(a.<columnName> AS TEXT) = ''12345''::TEXT ' = exact match

#       IF TEXT OR VARCHAR THEN
#           ' AND CAST(a.<columnName> AS TEXT) ILIKE ''ABC%'' ' = starts with (CI)
            ' AND CAST(a.<columnName> AS TEXT) ILIKE ''%ABC%'' ' = contains (CI)
            ' AND CAST(a.<columnName> AS TEXT) ILIKE ''%ABC'' ' = ends with
            ' AND CAST(a.<columnName> AS TEXT) = ''ABC''::text ' = exact match