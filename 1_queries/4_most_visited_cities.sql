SELECT p.city AS city, count(r.id) AS total_reservations
FROM reservations AS r
INNER JOIN properties AS p ON p.id = r.property_id
GROUP BY city
ORDER BY total_reservations DESC;