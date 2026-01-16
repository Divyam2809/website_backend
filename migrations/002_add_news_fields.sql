-- Add missing columns to news table
ALTER TABLE news ADD COLUMN slug VARCHAR(255) UNIQUE AFTER title;
ALTER TABLE news ADD COLUMN status VARCHAR(50) DEFAULT 'Draft' AFTER excerpt;
ALTER TABLE news ADD COLUMN metaTitle VARCHAR(255);
ALTER TABLE news ADD COLUMN metaDescription TEXT;
ALTER TABLE news ADD COLUMN metaKeywords VARCHAR(255);
