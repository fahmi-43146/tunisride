-- Re-insert Moulares city with correct Arabic name and link to Gafsa (ID 19)
-- Check if the entry already exists to prevent duplicates
INSERT INTO cities (governorate_id, name_en, name_ar, name_fr)
SELECT 19, 'Moulares', 'أم العرائس', 'Moularès'
WHERE NOT EXISTS (
    SELECT 1 FROM cities
    WHERE name_en = 'Moulares' AND governorate_id = 19
);
