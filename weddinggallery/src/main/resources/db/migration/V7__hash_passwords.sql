-- V7__hash_passwords.sql

-- Hash passwords for default users
UPDATE users SET password = '$2b$12$KvG8IxvWTNo2p8XBL7sgzOr8xLrVWsiJ503Me7UGJ0w3mN9G4v4Z6'
WHERE username = 'Ania_Kamil_2025';

UPDATE users SET password = '$2b$12$/9IAnS2OAKCXX0itw5VCeO2wwKyATuUOFWRHnwuOKudXyOxtEQ.CW'
WHERE username = 'admin';
