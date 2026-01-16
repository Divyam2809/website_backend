-- Add missing columns to testimonials table
ALTER TABLE testimonials ADD COLUMN slug VARCHAR(255) AFTER name;
ALTER TABLE testimonials ADD COLUMN status VARCHAR(50) DEFAULT 'Published' AFTER slug;
ALTER TABLE testimonials ADD COLUMN rating INT DEFAULT 5 AFTER position;
ALTER TABLE testimonials ADD COLUMN image VARCHAR(255) AFTER rating;
ALTER TABLE testimonials ADD COLUMN projectType VARCHAR(255) AFTER image;
ALTER TABLE testimonials ADD COLUMN metaTitle VARCHAR(255);
ALTER TABLE testimonials ADD COLUMN metaDescription TEXT;
ALTER TABLE testimonials ADD COLUMN metaKeywords VARCHAR(255);
