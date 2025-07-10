export interface AuthResponse {
  clientId: string;
  token: string;
  deviceName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  name?: string;
}
