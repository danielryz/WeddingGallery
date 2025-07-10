export interface ReactionRequest {
  type: string;
}

export interface ReactionResponse {
  id: number;
  type: string;
  photoId: number;
  deviceId: number;
  deviceName: string;
}

export interface ReactionCountResponse {
  type: string;
  count: number;
}
