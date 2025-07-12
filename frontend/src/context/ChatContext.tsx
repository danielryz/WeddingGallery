import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { sendChatMessage } from '../api/chat'
import type { ChatMessageResponse } from '../types/chat'

interface ChatContextValue {
  messages: ChatMessageResponse[]
  sendMessage: (text: string) => Promise<void>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
    })

    client.onConnect = () => {
      client.subscribe('/topic/chat', (frame) => {
        try {
          const msg: ChatMessageResponse = JSON.parse(frame.body)
          setMessages((prev) => [...prev, msg])
        } catch (err) {
          console.error('Error parsing message', err)
        }
      })
    }

    client.activate()
    clientRef.current = client

    return () => {
      // keep connection open across navigation
    }
  }, [])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    await sendChatMessage({ text })
  }

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
