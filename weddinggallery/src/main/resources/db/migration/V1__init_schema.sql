CREATE TABLE roles (
                       id          BIGSERIAL PRIMARY KEY,
                       name        VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Tabela Użytkowników (klienci/urzadzenia)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
                       id          BIGSERIAL PRIMARY KEY,
                       username    VARCHAR(100) NOT NULL,
                       client_id   UUID        NOT NULL UNIQUE,
                       name        VARCHAR(100),
                       device_info TEXT,
                       email       VARCHAR(255) UNIQUE,
                       password    VARCHAR(200) NOT NULL,
                       created_at  TIMESTAMP   NOT NULL DEFAULT now()
);

-- 3. Tabela łącząca Użytkowników i Role
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role_id BIGINT NOT NULL,
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE,
                            FOREIGN KEY (role_id) REFERENCES roles(id)   ON DELETE CASCADE
);

-- 4. Tabela Zdjęć
DROP TABLE IF EXISTS photo;
CREATE TABLE photos (
                        id          BIGSERIAL PRIMARY KEY,
                        file_name   VARCHAR(255) NOT NULL,
                        uploader_id BIGINT,
                        upload_time TIMESTAMP NOT NULL DEFAULT now(),
                        CONSTRAINT fk_photos_uploader
                            FOREIGN KEY (uploader_id)
                                REFERENCES users(id)
                                ON DELETE SET NULL
);