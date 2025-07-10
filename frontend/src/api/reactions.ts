import axiosInstance from './axiosInstance'
import {
  ReactionRequest,
  ReactionResponse,
  ReactionCountResponse,
} from '../types/reaction'

export const getReactionCounts = async (
  photoId: number,
): Promise<ReactionCountResponse[]> => {
  const res = await axiosInstance.get<ReactionCountResponse[]>(
    `/api/photos/${photoId}/reactions`,
  )
  return res.data
}

export const addReaction = async (
  photoId: number,
  data: ReactionRequest,
): Promise<ReactionResponse> => {
  const res = await axiosInstance.post<ReactionResponse>(
    `/api/photos/${photoId}/reactions`,
    data,
  )
  return res.data
}

export const deleteReaction = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/reactions/${id}`)
}
