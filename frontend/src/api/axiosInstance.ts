import axios, { AxiosHeaders } from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
})

axiosInstance.interceptors.request.use((config) => {
  const headers = new AxiosHeaders(config.headers)

  const token    = localStorage.getItem('token')
  const clientId = localStorage.getItem('clientId')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (clientId) {
    headers.set('X-client-Id', clientId)
  }

  config.headers = headers
  return config
})

export default axiosInstance
