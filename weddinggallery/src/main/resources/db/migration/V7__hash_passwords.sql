-- V7__hash_passwords.sql

-- Hash passwords for default users
UPDATE users SET password = '$10$I/vj2cns.1OIJghv1bMrJO4y.V8tcwpPgwDUbQZRu3F78nINwEu/.'
WHERE username = 'Ania_Kamil_2025';

UPDATE users SET password = '$10$5gKj/E3PsePX1exQTu6TAurrL.ekHHk10g8rhc0EGSuJ0LYMU6cZK'
WHERE username = 'admin';
