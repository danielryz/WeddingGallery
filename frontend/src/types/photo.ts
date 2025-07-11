export interface PhotoResponse {
  id: number;
  fileName: string;
  description: string | null;
  uploadTime: string;
  commentCount: number;
  reactionCount: number;
  uploaderUsername: string;
  deviceId: number;
  deviceName: string;
  visible: boolean;
  isVideo: boolean;
}

export interface PhotoDescriptionUpdateRequest {
  description: string;
}

export interface PhotoVisibilityUpdateRequest {
  visible: boolean;
}
