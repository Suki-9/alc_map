SELECT *, ((lat - @lat) * (lat - @lat) + (lng - @lng) * (lng - @lng)) AS distance
FROM 'geo_data'
ORDER BY distance
LIMIT 1;
