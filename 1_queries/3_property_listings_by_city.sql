SELECT p.id, p.title, p.cost_per_night, avg(pr.rating) AS average_rating 
FROM properties AS p
INNER JOIN property_reviews AS pr ON p.id = pr.property_id
WHERE p.city like '%ancouv%'
GROUP BY p.id, p.title, p.cost_per_night
HAVING avg(pr.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;