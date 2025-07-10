import axiosInstance from './axiosInstance'

import type {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatReactionRequest,
  ChatReactionResponse,
  ChatReactionCountResponse,
} from '../types/chat'
import type {Page} from '../types/page'

export const sendChatMessage = async (
  data: ChatMessageRequest,
): Promise<ChatMessageResponse> => {
  const res = await axiosInstance.post<ChatMessageResponse>(
    '/api/chat/messages',
    data,
  )
  return res.data
}

export const getChatMessages = async (
  page = 0,
  size = 20,
): Promise<Page<ChatMessageResponse>> => {
  const params = { page, size }
  const res = await axiosInstance.get<Page<ChatMessageResponse>>(
    '/api/chat/messages',
    { params },
  )
  return res.data
}

export const addChatReaction = async (
  messageId: number,
  data: ChatReactionRequest,
): Promise<ChatReactionResponse> => {
  const res = await axiosInstance.post<ChatReactionResponse>(
    `/api/chat/messages/${messageId}/reactions`,
    data,
  )
  return res.data
}

export const getChatReactions = async (
  messageId: number,
): Promise<ChatReactionResponse[]> => {
  const res = await axiosInstance.get<ChatReactionResponse[]>(
    `/api/chat/messages/${messageId}/reactions`,
  )
  return res.data
}

export const getChatReactionSummary = async (
  messageId: number,
): Promise<ChatReactionCountResponse[]> => {
  const res = await axiosInstance.get<ChatReactionCountResponse[]>(
    `/api/chat/messages/${messageId}/reactions/summary`,
  )
  return res.data
}

export const deleteChatReaction = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/chat/reactions/${id}`)
}
