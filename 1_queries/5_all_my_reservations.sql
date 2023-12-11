SELECT r.id AS id, p.title AS title, r.start_date AS start_date, 
    p.cost_per_night AS cost_per_night, avg(pr.rating) AS average_raing
FROM reservations AS r
INNER JOIN properties AS p ON p.id = r.property_id
INNER JOIN property_reviews AS pr ON p.id = pr.property_id
WHERE pr.guest_id = 1
GROUP BY r.id, p.id
ORDER BY r.start_date
LIMIT 10;