-- Correct the governorate_id for Moulares city if it's mismatched
-- IMPORTANT: Ensure '19' is the correct ID for Gafsa in your 'governorates' table.
-- You can verify this by running: SELECT id, name_en FROM governorates WHERE name_en = 'Gafsa';
UPDATE cities
SET governorate_id = 19 -- Replace '19' with the actual ID of Gafsa if it's different
WHERE name_en = 'Moulares';
