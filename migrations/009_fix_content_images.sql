-- Change image columns to LONGTEXT to support Base64 storage for content modules
ALTER TABLE blogs MODIFY COLUMN image LONGTEXT;
ALTER TABLE news MODIFY COLUMN image LONGTEXT;
ALTER TABLE case_studies MODIFY COLUMN image LONGTEXT;
