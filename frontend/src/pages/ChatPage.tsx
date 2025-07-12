import React, { useState, useEffect, useRef } from 'react';
import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  addChatReaction,
  getChatReactionSummary,
  sendChatMessage,
  getChatMessages
} from '../api/chat';
import type {ChatMessageResponse, ChatReactionCountResponse} from '../types/chat';
import './ChatPage.css';

function ChatMessage({ message }: { message: ChatMessageResponse }) {
  const [reactions, setReactions] = useState<ChatReactionCountResponse[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout | null>(null);
  const localDeviceId = Number(localStorage.getItem('deviceId'));
  const isOwn = message.deviceId === localDeviceId;

  useEffect(() => {
    getChatReactionSummary(message.id).then(setReactions);
  }, [message.id]);

  const handleReactionSelect = async (emoji: string) => {
    try {
      await addChatReaction(message.id, { emoji });
      setReactions(await getChatReactionSummary(message.id));
    } catch (err) {
      console.error('Błąd dodawania reakcji do wiadomości:', err);
    } finally {
      setShowPicker(false);
    }
  };

  const handleHoldStart = () => {
    const timeout = setTimeout(() => setShowPicker(true), 400);
    setHoldTimeout(timeout);
  };
  const handleHoldEnd = () => {
    if (holdTimeout) clearTimeout(holdTimeout);
  };

  const EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎'];

  return (
      <div
          className={`chat-message ${isOwn ? 'own' : ''}`}
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
      >
        {/* Pojedynczy dymek wiadomości */}
        <div className={`chat-bubble ${isOwn ? 'own' : 'other'}`}>
          {!isOwn && (
              <div className="chat-sender-name">{message.deviceName}</div>
          )}
          <div>{message.text}</div>
          {showPicker && (
              <div className="emoji-picker">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => handleReactionSelect(emoji)}
                    >
                      {emoji}
                    </button>
                ))}
              </div>
          )}
        </div>
        {/* Podsumowanie reakcji pod wiadomością */}
        {reactions.length > 0 && (
            <div className={`reaction-summary ${isOwn ? 'own' : ''}`}>
              {reactions.map(r => (
                  <span key={r.emoji} className="reaction-item">
              <span>{r.emoji}</span>
              <span>{r.count}</span>
            </span>
              ))}
            </div>
        )}
      </div>
  );
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [text, setText] = useState('');
  const subRef = useRef<StompSubscription | null>(null);
  const clientRef = useRef<Client | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // Pobierz historię wiadomości z paginacją (ustaw wysoki rozmiar)
    getChatMessages(0, 1000)
        .then(page => setMessages(page.content))
        .catch(err => console.error('Błąd pobierania historii czatu:', err));

    if (!clientRef.current) {
      clientRef.current = new Client({
        webSocketFactory: () => new SockJS(`${API_URL}/ws`),
        reconnectDelay: 5000
      });
    }
    const client = clientRef.current;
    const subscribe = () => {
      subRef.current = client.subscribe('/topic/chat', frame => {
        try {
          const msg: ChatMessageResponse = JSON.parse(frame.body);
          setMessages(prev => [...prev, msg]);
        } catch (err) {
          console.error('Error parsing chat message', err);
        }
      });
    };
    if (client.connected) {
      subscribe();
    } else {
      client.onConnect = subscribe;
      if (!client.active) {
        client.activate();
      }
    }
    return () => {
      subRef.current?.unsubscribe();
    };
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendChatMessage({ text });
      setText('');
    } catch (err) {
      console.error('Błąd wysyłania wiadomości:', err);
    }
  };

  return (
      <main className="chat-page">
        <h1 className="chat-title">Czat</h1>
        {/* Obszar wiadomości */}
        <div className="chat-messages">
          {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
          ))}
        </div>
        {/* Pole wpisywania nowej wiadomości */}
        <div className="chat-input-area">
          <input
              className="chat-input"
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Napisz wiadomość..."
          />
          <button onClick={handleSend} className="chat-send-button">
            Wyślij
          </button>
        </div>
      </main>
  );
};

export default ChatPage;
