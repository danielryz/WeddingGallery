export interface AuthResponse {
  clientId: string;
  token: string;
  deviceName: string;
  deviceId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  name?: string;
}
