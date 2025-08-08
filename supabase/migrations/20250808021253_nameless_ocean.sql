/*
  # Add Dummy Data for Testing

  1. Sample Data
    - Add sample admin users
    - Add sample domain categories
    - Add sample domains with metrics
    - Add sample transactions
    - Add sample popular searches

  2. Complete Test Dataset
    - Realistic domain data
    - Various price ranges
    - Different statuses (available, sold, featured, popular)
    - SEO metrics for testing
*/

-- Insert sample domain categories (if not exists)
INSERT INTO domain_categories (name, extension, description, is_active) VALUES
('Domain ID Premium', '.id', 'Domain Indonesia premium untuk bisnis lokal', true),
('Domain COM Global', '.com', 'Domain komersial internasional terpercaya', true),
('Domain ORG Nonprofit', '.org', 'Domain untuk organisasi dan yayasan', true),
('Domain AC.ID Akademik', '.ac.id', 'Domain khusus institusi pendidikan Indonesia', true),
('Domain CO.ID Bisnis', '.co.id', 'Domain komersial Indonesia untuk perusahaan', true),
('Domain OR.ID Organisasi', '.or.id', 'Domain resmi untuk organisasi Indonesia', true)
ON CONFLICT (extension) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Insert sample admin users
INSERT INTO admins (email, full_name, role, is_active) VALUES
('admin@domainluxe.com', 'Administrator Utama', 'super_admin', true),
('manager@domainluxe.com', 'Domain Manager', 'admin', true),
('support@domainluxe.com', 'Customer Support', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Get category IDs for reference
DO $$
DECLARE
    cat_id_id uuid;
    cat_com_id uuid;
    cat_org_id uuid;
    cat_ac_id uuid;
    cat_co_id uuid;
    cat_or_id uuid;
    admin_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_id_id FROM domain_categories WHERE extension = '.id';
    SELECT id INTO cat_com_id FROM domain_categories WHERE extension = '.com';
    SELECT id INTO cat_org_id FROM domain_categories WHERE extension = '.org';
    SELECT id INTO cat_ac_id FROM domain_categories WHERE extension = '.ac.id';
    SELECT id INTO cat_co_id FROM domain_categories WHERE extension = '.co.id';
    SELECT id INTO cat_or_id FROM domain_categories WHERE extension = '.or.id';
    
    -- Get admin ID
    SELECT id INTO admin_id FROM admins WHERE email = 'admin@domainluxe.com';

    -- Insert sample domains
    INSERT INTO domains (name, extension, price, category_id, registrar, registered_date, expiry_date, is_sold, is_featured, is_popular, view_count, search_count, admin_id, description, tags) VALUES
    -- Featured domains
    ('teknologi', '.id', 2500000, cat_id_id, 'Niagahoster', '2024-01-15', '2025-01-15', false, true, true, 156, 45, admin_id, 'Domain premium untuk bisnis teknologi Indonesia', ARRAY['teknologi', 'bisnis', 'startup']),
    ('bisnisonline', '.com', 3200000, cat_com_id, 'GoDaddy', '2023-08-20', '2025-08-20', false, true, false, 89, 23, admin_id, 'Perfect domain for online business ventures', ARRAY['business', 'online', 'ecommerce']),
    ('pendidikan', '.org', 1800000, cat_org_id, 'Rumahweb', '2024-03-10', '2025-03-10', false, true, true, 234, 67, admin_id, 'Domain ideal untuk lembaga pendidikan', ARRAY['pendidikan', 'sekolah', 'universitas']),
    
    -- Popular domains
    ('startup', '.id', 2100000, cat_id_id, 'Domainesia', '2024-02-05', '2025-02-05', false, false, true, 345, 89, admin_id, 'Domain untuk startup dan perusahaan rintisan', ARRAY['startup', 'bisnis', 'inovasi']),
    ('digitalmarketing', '.com', 2800000, cat_com_id, 'Exabytes', '2023-11-12', '2024-11-12', false, false, true, 198, 56, admin_id, 'Premium domain for digital marketing agencies', ARRAY['marketing', 'digital', 'agency']),
    ('komunitas', '.org', 1500000, cat_org_id, 'Niagahoster', '2024-04-18', '2025-04-18', false, false, true, 167, 34, admin_id, 'Domain untuk membangun komunitas online', ARRAY['komunitas', 'sosial', 'networking']),
    
    -- Academic domains
    ('universitasnusantara', '.ac.id', 1200000, cat_ac_id, 'Rumahweb', '2024-01-08', '2025-01-08', false, false, false, 78, 12, admin_id, 'Domain untuk universitas swasta Indonesia', ARRAY['universitas', 'pendidikan', 'akademik']),
    ('sekolahdigital', '.ac.id', 950000, cat_ac_id, 'Domainesia', '2024-05-22', '2025-05-22', false, false, false, 45, 8, admin_id, 'Domain untuk sekolah dengan fokus teknologi digital', ARRAY['sekolah', 'digital', 'teknologi']),
    
    -- Business domains
    ('exportimport', '.co.id', 1800000, cat_co_id, 'GoDaddy', '2023-12-03', '2024-12-03', false, false, false, 123, 28, admin_id, 'Domain untuk perusahaan ekspor impor', ARRAY['ekspor', 'impor', 'perdagangan']),
    ('konsultanbisnis', '.co.id', 2200000, cat_co_id, 'Exabytes', '2024-06-15', '2025-06-15', false, false, false, 89, 19, admin_id, 'Domain untuk jasa konsultan bisnis profesional', ARRAY['konsultan', 'bisnis', 'profesional']),
    
    -- Organization domains
    ('yayasanpendidikan', '.or.id', 1100000, cat_or_id, 'Niagahoster', '2024-02-28', '2025-02-28', false, false, false, 67, 15, admin_id, 'Domain untuk yayasan pendidikan Indonesia', ARRAY['yayasan', 'pendidikan', 'sosial']),
    ('lsmpeduli', '.or.id', 850000, cat_or_id, 'Rumahweb', '2024-07-10', '2025-07-10', false, false, false, 34, 7, admin_id, 'Domain untuk LSM peduli lingkungan dan sosial', ARRAY['lsm', 'lingkungan', 'sosial']),
    
    -- Sold domains (examples)
    ('ecommerceid', '.id', 3500000, cat_id_id, 'Domainesia', '2023-09-15', '2024-09-15', true, false, false, 456, 123, admin_id, 'Domain premium untuk platform e-commerce Indonesia', ARRAY['ecommerce', 'marketplace', 'jual-beli']),
    ('fintech', '.com', 4200000, cat_com_id, 'GoDaddy', '2023-07-08', '2024-07-08', true, true, true, 678, 189, admin_id, 'Premium domain for fintech companies', ARRAY['fintech', 'finance', 'technology']),
    
    -- More available domains
    ('healthtech', '.id', 2600000, cat_id_id, 'Exabytes', '2024-03-25', '2025-03-25', false, false, false, 145, 32, admin_id, 'Domain untuk startup kesehatan digital', ARRAY['kesehatan', 'teknologi', 'medis']),
    ('agritech', '.com', 2900000, cat_com_id, 'Niagahoster', '2024-04-12', '2025-04-12', false, false, false, 98, 21, admin_id, 'Domain for agricultural technology solutions', ARRAY['pertanian', 'teknologi', 'agritech'])
    ON CONFLICT (name, extension) DO NOTHING;

END $$;

-- Insert domain metrics for all domains
INSERT INTO domain_metrics (domain_id, da, pa, ss, dr, bl)
SELECT 
    d.id,
    CASE 
        WHEN d.is_featured THEN FLOOR(RANDOM() * 30) + 40  -- Featured: 40-70
        WHEN d.is_popular THEN FLOOR(RANDOM() * 25) + 30   -- Popular: 30-55
        ELSE FLOOR(RANDOM() * 40) + 10                     -- Regular: 10-50
    END as da,
    CASE 
        WHEN d.is_featured THEN FLOOR(RANDOM() * 25) + 35  -- Featured: 35-60
        WHEN d.is_popular THEN FLOOR(RANDOM() * 20) + 25   -- Popular: 25-45
        ELSE FLOOR(RANDOM() * 30) + 15                     -- Regular: 15-45
    END as pa,
    FLOOR(RANDOM() * 3) + 1 as ss,  -- SS: 1-3
    CASE 
        WHEN d.is_featured THEN ROUND((RANDOM() * 20 + 15)::numeric, 1)  -- Featured: 15-35
        WHEN d.is_popular THEN ROUND((RANDOM() * 15 + 10)::numeric, 1)   -- Popular: 10-25
        ELSE ROUND((RANDOM() * 20 + 5)::numeric, 1)                      -- Regular: 5-25
    END as dr,
    CASE 
        WHEN RANDOM() < 0.3 THEN (FLOOR(RANDOM() * 900) + 100)::text     -- 100-999
        WHEN RANDOM() < 0.6 THEN (FLOOR(RANDOM() * 99) + 1)::text || 'K' -- 1K-99K
        ELSE (FLOOR(RANDOM() * 49) + 1)::text || 'M'                     -- 1M-49M
    END as bl
FROM domains d
WHERE NOT EXISTS (
    SELECT 1 FROM domain_metrics dm WHERE dm.domain_id = d.id
);

-- Insert sample transactions
DO $$
DECLARE
    domain_sold_1 uuid;
    domain_sold_2 uuid;
    admin_id uuid;
BEGIN
    -- Get sold domain IDs
    SELECT id INTO domain_sold_1 FROM domains WHERE name = 'ecommerceid' AND extension = '.id';
    SELECT id INTO domain_sold_2 FROM domains WHERE name = 'fintech' AND extension = '.com';
    SELECT id INTO admin_id FROM admins WHERE email = 'admin@domainluxe.com';

    -- Insert completed transactions for sold domains
    INSERT INTO transactions (domain_id, transaction_id, amount, status, payment_method, buyer_info, verified_by, verified_at) VALUES
    (domain_sold_1, 'TXN-ECOM-001', 3500000, 'completed', 'qris', 
     '{"name": "Budi Santoso", "email": "budi@ecommerce.id", "phone": "+6281234567890", "company": "PT Ecommerce Indonesia"}', 
     admin_id, '2024-01-20 10:30:00'),
    (domain_sold_2, 'TXN-FINTECH-002', 4200000, 'completed', 'qris', 
     '{"name": "Sarah Johnson", "email": "sarah@fintech.com", "phone": "+6281987654321", "company": "Fintech Solutions Ltd"}', 
     admin_id, '2024-02-15 14:45:00');

    -- Insert some pending transactions
    INSERT INTO transactions (domain_id, transaction_id, amount, status, payment_method, buyer_info) VALUES
    ((SELECT id FROM domains WHERE name = 'teknologi' AND extension = '.id'), 'TXN-PENDING-001', 2500000, 'pending', 'qris', 
     '{"name": "Ahmad Rahman", "email": "ahmad@teknologi.id", "phone": "+6281122334455", "company": "Tech Startup"}'),
    ((SELECT id FROM domains WHERE name = 'bisnisonline' AND extension = '.com'), 'TXN-PENDING-002', 3200000, 'paid', 'qris', 
     '{"name": "Lisa Chen", "email": "lisa@business.com", "phone": "+6281556677889", "company": "Online Business Corp"}');

END $$;

-- Insert popular searches
INSERT INTO popular_searches (search_term, search_count, last_searched) VALUES
('teknologi', 156, '2024-01-08 09:15:00'),
('bisnis', 134, '2024-01-08 10:22:00'),
('startup', 98, '2024-01-08 11:30:00'),
('ecommerce', 87, '2024-01-08 12:45:00'),
('digital', 76, '2024-01-08 13:20:00'),
('pendidikan', 65, '2024-01-08 14:10:00'),
('kesehatan', 54, '2024-01-08 15:35:00'),
('fintech', 43, '2024-01-08 16:40:00'),
('marketing', 38, '2024-01-08 17:25:00'),
('konsultan', 29, '2024-01-08 18:15:00')
ON CONFLICT (search_term) DO UPDATE SET
  search_count = EXCLUDED.search_count,
  last_searched = EXCLUDED.last_searched;

-- Insert domain suggestions (related domains)
INSERT INTO domain_suggestions (domain_id, suggested_domain_id, similarity_score)
SELECT 
    d1.id as domain_id,
    d2.id as suggested_domain_id,
    0.75 as similarity_score
FROM domains d1
CROSS JOIN domains d2
WHERE d1.id != d2.id
  AND d1.extension = d2.extension
  AND NOT d1.is_sold
  AND NOT d2.is_sold
  AND d1.name IN ('teknologi', 'startup', 'bisnisonline')
  AND d2.name IN ('healthtech', 'agritech', 'digitalmarketing')
ON CONFLICT (domain_id, suggested_domain_id) DO NOTHING;

-- Update sold domains with sold date and price
UPDATE domains 
SET sold_date = '2024-01-20 10:30:00', sold_price = 3500000 
WHERE name = 'ecommerceid' AND extension = '.id';

UPDATE domains 
SET sold_date = '2024-02-15 14:45:00', sold_price = 4200000 
WHERE name = 'fintech' AND extension = '.com';