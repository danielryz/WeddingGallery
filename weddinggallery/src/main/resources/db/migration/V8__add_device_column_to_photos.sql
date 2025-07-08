ALTER TABLE photos
    ADD COLUMN device_id BIGINT;

ALTER TABLE photos
    ADD CONSTRAINT fk_photos_device
        FOREIGN KEY (device_id)
            REFERENCES devices(id)
            ON DELETE SET NULL;
