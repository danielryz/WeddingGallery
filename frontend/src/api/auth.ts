import axiosInstance from './axiosInstance'
import type {AuthResponse, LoginRequest} from '../types/auth'

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>('/api/auth/login', data)
  localStorage.setItem('clientId', res.data.clientId)
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('deviceId', res.data.deviceId.toString())
  localStorage.setItem( 'deviceName', res.data.deviceName)
  return res.data
}
