export interface ChatMessageRequest {
  text: string;
}

export interface ChatMessageResponse {
  id: number;
  username: string;
  text: string;
  createdAt: string;
  deviceId: number;
  deviceName: string;
}

export interface ChatReactionRequest {
  emoji: string;
}

export interface ChatReactionResponse {
  id: number;
  emoji: string;
  messageId: number;
  deviceId: number;
  deviceName: string;
}

export interface ChatReactionCountResponse {
  emoji: string;
  count: number;
}
