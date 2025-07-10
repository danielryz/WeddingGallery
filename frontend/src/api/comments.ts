import axiosInstance from './axiosInstance'
import type {CommentRequest, CommentResponse} from '../types/comment'
import type { Page } from '../types/page'

export const addComment = async (
  photoId: number,
  data: CommentRequest,
): Promise<CommentResponse> => {
  const res = await axiosInstance.post<CommentResponse>(
    `/api/photos/${photoId}/comments`,
    data,
  )
  return res.data
}

export const getComments = async (
  photoId: number,
  page = 0,
  size = 20,
): Promise<Page<CommentResponse>> => {
  const params = { page, size }
  const res = await axiosInstance.get<Page<CommentResponse>>(
    `/api/photos/${photoId}/comments`,
    { params },
  )
  return res.data
}

export const deleteComment = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/comments/${id}`)
}

export const adminDeleteComment = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/admin/comments/${id}`)
}
