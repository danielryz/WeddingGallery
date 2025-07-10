import { useState, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { addChatReaction, getChatReactionSummary } from '../api/chat'
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

function ChatPage() {
  const { messages, sendMessage } = useChat()
  const [text, setText] = useState('')

  const handleSend = async () => {
    await sendMessage(text)
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
