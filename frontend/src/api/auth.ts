import axiosInstance from './axiosInstance'
import { AuthResponse, LoginRequest } from '../types/auth'

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>('/api/auth/login', data)
  localStorage.setItem('clientId', res.data.clientId)
  localStorage.setItem('token', res.data.token)
  return res.data
}
