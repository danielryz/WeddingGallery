ALTER TABLE reactions
    ADD CONSTRAINT uq_reactions_device_photo UNIQUE (device_id, photo_id);

ALTER TABLE chat_message_reactions
    ADD CONSTRAINT uq_chat_reactions_device_message UNIQUE (device_id, message_id);
