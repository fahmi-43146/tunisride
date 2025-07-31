-- Insert governorates
INSERT INTO governorates (name_en, name_ar, name_fr) VALUES
('Tunis', 'تونس', 'Tunis'),
('Ariana', 'أريانة', 'Ariana'),
('Ben Arous', 'بن عروس', 'Ben Arous'),
('Manouba', 'منوبة', 'Manouba'),
('Nabeul', 'نابل', 'Nabeul'),
('Zaghouan', 'زغوان', 'Zaghouan'),
('Bizerte', 'بنزرت', 'Bizerte'),
('Béja', 'باجة', 'Béja'),
('Jendouba', 'جندوبة', 'Jendouba'),
('Kef', 'الكاف', 'Kef'),
('Siliana', 'سليانة', 'Siliana'),
('Kairouan', 'القيروان', 'Kairouan'),
('Kasserine', 'القصرين', 'Kasserine'),
('Sidi Bouzid', 'سيدي بوزيد', 'Sidi Bouzid'),
('Sousse', 'سوسة', 'Sousse'),
('Monastir', 'المنستير', 'Monastir'),
('Mahdia', 'المهدية', 'Mahdia'),
('Sfax', 'صفاقس', 'Sfax'),
('Gafsa', 'قفصة', 'Gafsa'),
('Tozeur', 'توزر', 'Tozeur'),
('Kebili', 'قبلي', 'Kebili'),
('Gabes', 'قابس', 'Gabès'),
('Medenine', 'مدنين', 'Médenine'),
('Tataouine', 'تطاوين', 'Tataouine');

-- Insert major cities for key governorates
INSERT INTO cities (governorate_id, name_en, name_ar, name_fr) VALUES
-- Tunis
(1, 'Tunis', 'تونس', 'Tunis'),
(1, 'Carthage', 'قرطاج', 'Carthage'),
(1, 'La Marsa', 'المرسى', 'La Marsa'),
(1, 'Sidi Bou Said', 'سيدي بو سعيد', 'Sidi Bou Said'),

-- Ariana
(2, 'Ariana', 'أريانة', 'Ariana'),
(2, 'Ettadhamen', 'التضامن', 'Ettadhamen'),
(2, 'Raoued', 'الراوية', 'Raoued'),

-- Sousse
(15, 'Sousse', 'سوسة', 'Sousse'),
(15, 'Hammam Sousse', 'حمام سوسة', 'Hammam Sousse'),
(15, 'Msaken', 'مساكن', 'Msaken'),

-- Sfax
(18, 'Sfax', 'صفاقس', 'Sfax'),
(18, 'Sakiet Ezzit', 'ساقية الزيت', 'Sakiet Ezzit'),
(18, 'Sakiet Eddaier', 'ساقية الدائر', 'Sakiet Eddaier'),

-- Nabeul
(5, 'Nabeul', 'نابل', 'Nabeul'),
(5, 'Hammamet', 'الحمامات', 'Hammamet'),
(5, 'Kelibia', 'قليبية', 'Kélibia'),

-- Monastir
(16, 'Monastir', 'المنستير', 'Monastir'),
(16, 'Skanes', 'سكانس', 'Skanes'),
(16, 'Bekalta', 'بقلطة', 'Bekalta'),

-- Bizerte
(7, 'Bizerte', 'بنزرت', 'Bizerte'),
(7, 'Menzel Bourguiba', 'منزل بورقيبة', 'Menzel Bourguiba'),
(7, 'Mateur', 'ماطر', 'Mateur'),

-- Kairouan
(12, 'Kairouan', 'القيروان', 'Kairouan'),
(12, 'Sbikha', 'سبيخة', 'Sbikha'),
(12, 'Haffouz', 'حفوز', 'Haffouz'),

-- Gabes
(22, 'Gabes', 'قابس', 'Gabès'),
(22, 'Mareth', 'مارث', 'Mareth'),
(22, 'Metouia', 'متوية', 'Métouia'),

-- Gafsa
(19, 'Gafsa', 'قفصة', 'Gafsa'),
(19, 'Metlaoui', 'المتلوي', 'Métlaoui'),
(19, 'Redeyef', 'الرديف', 'Redeyef'),

-- Add more cities for various governorates to ensure broader coverage
-- Ben Arous
(3, 'Mohamedia', 'المحمدية', 'Mohamedia'),
(3, 'Fouchana', 'فوشانة', 'Fouchana'),
-- Manouba
(4, 'Manouba', 'منوبة', 'Manouba'),
(4, 'Den Den', 'دندان', 'Den Den'),
-- Zaghouan
(6, 'Zaghouan', 'زغوان', 'Zaghouan'),
(6, 'El Fahs', 'الفحص', 'El Fahs'),
-- Béja
(8, 'Béja', 'باجة', 'Béja'),
(8, 'Testour', 'تستور', 'Testour'),
-- Jendouba
(9, 'Jendouba', 'جندوبة', 'Jendouba'),
(9, 'Tabarka', 'طبرقة', 'Tabarka'),
-- Kef
(10, 'El Kef', 'الكاف', 'El Kef'),
(10, 'Dahmani', 'الدهماني', 'Dahmani'),
-- Siliana
(11, 'Siliana', 'سليانة', 'Siliana'),
(11, 'Gaafour', 'قعفور', 'Gaafour'),
-- Kasserine
(13, 'Kasserine', 'القصرين', 'القصرين'),
(13, 'Sbeitla', 'سبيطلة', 'Sbeïtla'),
-- Sidi Bouzid
(14, 'Sidi Bouzid', 'سيدي بوزيد', 'Sidi Bouzid'),
(14, 'Meknassy', 'المكنسي', 'Meknassy'),
-- Mahdia
(17, 'Mahdia', 'المهدية', 'Mahdia'),
(17, 'El Jem', 'الجم', 'El Jem'),
-- Tozeur
(20, 'Tozeur', 'توزر', 'Tozeur'),
(20, 'Nefta', 'نفطة', 'Nefta'),
-- Kebili
(21, 'Kebili', 'قبلي', 'Kébili'),
(21, 'Douz', 'دوز', 'Douz'),
-- Medenine
(23, 'Medenine', 'مدنين', 'Médenine'),
(23, 'Djerba Midoun', 'جربة ميدون', 'Djerba Midoun'),
-- Tataouine
(24, 'Tataouine', 'تطاوين', 'Tataouine'),
(24, 'Remada', 'رمادة', 'Remada');
