-- V3__seed_user_and_admin.sql

-- 1) Wstawiamy konto „user” z rolą USER
ALTER TABLE users
    ADD CONSTRAINT uq_users_username UNIQUE (username);

INSERT INTO users (username, password, client_id, name, device_info, created_at)
VALUES (
           'Ania_Kamil_2025',
           '23sierpnia',
           '00000000-0000-0000-0000-000000000003'::UUID,
           NULL,
           NULL,
           now()
       )
    ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
         JOIN roles r ON r.name = 'ROLE_USER'
WHERE u.username = 'Ania_Kamil_2025'
    ON CONFLICT DO NOTHING;


-- 2) Wstawiamy konto „admin” z rolą ADMIN
INSERT INTO users (username, password, client_id, name, device_info, created_at)
VALUES (
           'admin',
           'Ania_Kamil@2308',
           '00000000-0000-0000-0000-000000000004'::UUID,
           NULL,
           NULL,
           now()
       )
    ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
         JOIN roles r ON r.name = 'ROLE_ADMIN'WHERE u.username = 'admin'
    ON CONFLICT DO NOTHING;