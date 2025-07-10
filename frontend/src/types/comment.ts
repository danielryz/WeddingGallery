export interface CommentRequest {
  text: string;
}

export interface CommentResponse {
  id: number;
  text: string;
  createdAt: string;
  photoId: number;
  deviceId: number;
  deviceName: string;
}
