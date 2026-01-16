-- Add missing columns to awards table
ALTER TABLE awards ADD COLUMN description TEXT AFTER prize;
ALTER TABLE awards ADD COLUMN date VARCHAR(50) AFTER organization;
ALTER TABLE awards ADD COLUMN metaTitle VARCHAR(255);
ALTER TABLE awards ADD COLUMN metaDescription TEXT;
ALTER TABLE awards ADD COLUMN metaKeywords VARCHAR(255);
