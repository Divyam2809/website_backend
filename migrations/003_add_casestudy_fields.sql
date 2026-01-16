-- Add missing columns to case_studies table
ALTER TABLE case_studies ADD COLUMN status VARCHAR(50) DEFAULT 'Draft' AFTER slug;
ALTER TABLE case_studies ADD COLUMN date VARCHAR(50) AFTER status;
ALTER TABLE case_studies ADD COLUMN author VARCHAR(255) AFTER date;
ALTER TABLE case_studies ADD COLUMN metaTitle VARCHAR(255);
ALTER TABLE case_studies ADD COLUMN metaDescription TEXT;
ALTER TABLE case_studies ADD COLUMN metaKeywords VARCHAR(255);
