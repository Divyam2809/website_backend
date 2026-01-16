-- Change image columns to LONGTEXT to support Base64 storage
ALTER TABLE awards MODIFY COLUMN image LONGTEXT;
ALTER TABLE team MODIFY COLUMN image LONGTEXT;
ALTER TABLE testimonials MODIFY COLUMN image LONGTEXT;
