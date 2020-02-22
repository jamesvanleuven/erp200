DROP MATERIALIZED VIEW IF EXISTS matview_addresses;

CREATE MATERIALIZED VIEW matview_addresses
AS 
    SELECT 
        a.id,
        a.street,
        a.city_id,
        b.township,
        b.province_id,
        b.province
    FROM sys_addresses a 
    LEFT OUTER JOIN sys_municipalities b ON b.id = a.city_id
    ORDER BY b.province_id, b.township;

CREATE UNIQUE INDEX "matview_addresses_id_seq" ON matview_addresses(id);
REFRESH MATERIALIZED VIEW CONCURRENTLY matview_addresses;
SELECT * FROM matview_addresses;