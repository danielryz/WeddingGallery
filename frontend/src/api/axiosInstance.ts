import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const clientId = localStorage.getItem('clientId')
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  }
  if (clientId) {
    config.headers = { ...config.headers, 'X-client-Id': clientId }
  }
  return config
})

export default axiosInstance
