import axiosInstance from './axiosInstance'
import type { AxiosProgressEvent } from 'axios';
import type {
  PhotoResponse,
  PhotoDescriptionUpdateRequest,
  PhotoVisibilityUpdateRequest,
} from '../types/photo'
import type { Page } from '../types/page'

export const getPhotos = async (
  page = 0,
  size = 20,
  sortBy = 'uploadTime',
  direction = 'desc',
  type?: string,
): Promise<Page<PhotoResponse>> => {
  const params: Record<string, string | number> = {
    page,
    size,
    sortBy,
    direction,
  }
  if (type) params.type = type
  const res = await axiosInstance.get<Page<PhotoResponse>>('/api/photos', { params })
  return res.data
}

export const getDevicePhotos = async (
  page = 0,
  size = 20,
  sortBy = 'uploadTime',
  direction = 'desc',
  type?: string,
): Promise<Page<PhotoResponse>> => {
  const params: Record<string, string | number> = {
    page,
    size,
    sortBy,
    direction,
  }
  if (type) params.type = type
  const res = await axiosInstance.get<Page<PhotoResponse>>('/api/photos/device', { params })
  return res.data
}

export const getPhoto = async (id: number): Promise<PhotoResponse> => {
  const res = await axiosInstance.get<PhotoResponse>(`/api/photos/${id}`)
  return res.data
}

export const savePhoto = async (file: File, description?: string): Promise<void> => {
  const form = new FormData()
  form.append('file', file)
  if (description) form.append('description', description)
  await axiosInstance.post('/api/photos', form)
}

export const savePhotos = async (
    files: File[],
    descriptions?: string[],
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<void> => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  descriptions?.forEach((d) => form.append('descriptions', d));

  await axiosInstance.post('/api/photos/batch', form, {
    onUploadProgress,
  });
};

export const deletePhoto = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/photos/${id}`)
}

export const adminDeletePhoto = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/photos/admin/${id}`)
}

export const downloadArchive = async (): Promise<Blob> => {
  const res = await axiosInstance.get('/api/photos/admin/archive', { responseType: 'blob' })
  return res.data
}

export const updateDescription = async (
  id: number,
  data: PhotoDescriptionUpdateRequest,
): Promise<String> => {
  await axiosInstance.put<PhotoResponse>(`/api/photos/${id}/description`, data)
  return "Opis został zaktualizowany."
}

export const updateVisibility = async (
  id: number,
  data: PhotoVisibilityUpdateRequest,
): Promise<String> => {
  await axiosInstance.put<PhotoResponse>(`/api/photos/${id}/visibility`, data)
  return "Zdjęcie zostało usunięte."
}
