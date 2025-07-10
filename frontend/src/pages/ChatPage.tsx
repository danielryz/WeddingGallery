import { useState, useEffect, useRef } from 'react'
import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { addChatReaction, getChatReactionSummary, sendChatMessage } from '../api/chat'
import type { ChatMessageResponse, ChatReactionCountResponse } from '../types/chat'

function ChatMessage({ message }: { message: ChatMessageResponse }) {
  const [reactions, setReactions] = useState<ChatReactionCountResponse[]>([])

  useEffect(() => {
    getChatReactionSummary(message.id).then(setReactions)
  }, [message.id])

  const handleReaction = async (emoji: string) => {
    await addChatReaction(message.id, { emoji })
    setReactions(await getChatReactionSummary(message.id))
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div>
        <strong>{message.deviceName}: </strong>
        {message.text}
      </div>
      <div>
        {['😀', '❤️', '👍'].map((e) => (
          <button key={e} type="button" onClick={() => handleReaction(e)}>
            {e}
          </button>
        ))}
      </div>
      <div>
        {reactions.map((r) => (
          <span key={r.emoji} style={{ marginRight: '0.5rem' }}>
            {r.emoji} {r.count}
          </span>
        ))}
      </div>
    </div>
  )
}

let stompClient: Client | null = null

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [text, setText] = useState('')
  const subRef = useRef<StompSubscription | null>(null)

  useEffect(() => {
    if (!stompClient) {
      stompClient = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        reconnectDelay: 5000,
      })
    }

    const client = stompClient

    const subscribe = () => {
      subRef.current = client.subscribe('/topic/chat', (frame) => {
        try {
          const msg: ChatMessageResponse = JSON.parse(frame.body)
          setMessages((prev) => [...prev, msg])
        } catch (err) {
          console.error('Error parsing message', err)
        }
      })
    }

    if (client.connected) {
      subscribe()
    } else {
      client.onConnect = subscribe
      if (!client.active) {
        client.activate()
      }
    }

    return () => {
      subRef.current?.unsubscribe()
    }
  }, [])

  const handleSend = async () => {
    if (!text.trim()) return
    await sendChatMessage({ text })
    setText('')
  }

  return (
    <div>
      <div>
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>
      <div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button type="button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatPage
