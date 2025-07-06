
ALTER TABLE users
DROP COLUMN IF EXISTS client_id,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS device_info,
  DROP COLUMN IF EXISTS created_at;

CREATE TABLE devices (
                         id          BIGSERIAL PRIMARY KEY,
                         client_id   UUID        NOT NULL UNIQUE,
                         user_id     BIGINT      NOT NULL REFERENCES users(id),
                         name        VARCHAR(100),
                         device_info TEXT,
                         created_at  TIMESTAMP   NOT NULL DEFAULT now()
);

