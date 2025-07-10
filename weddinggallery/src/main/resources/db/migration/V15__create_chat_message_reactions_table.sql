CREATE TABLE chat_message_reactions (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
