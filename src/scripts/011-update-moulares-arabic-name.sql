-- Update the Arabic name for Moulares city
UPDATE cities
SET name_ar = 'أم العرائس'
WHERE name_en = 'Moulares' AND governorate_id = 19; -- Assuming Gafsa's ID is 19
