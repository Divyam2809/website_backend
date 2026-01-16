-- Update faqs table with missing columns
ALTER TABLE faqs ADD COLUMN slug VARCHAR(255) AFTER question;
ALTER TABLE faqs ADD COLUMN status VARCHAR(50) DEFAULT 'Published' AFTER slug;
ALTER TABLE faqs ADD COLUMN sort_order INT DEFAULT 0 AFTER category;
ALTER TABLE faqs ADD COLUMN metaTitle VARCHAR(255);
ALTER TABLE faqs ADD COLUMN metaDescription TEXT;
ALTER TABLE faqs ADD COLUMN metaKeywords VARCHAR(255);
