import React, { useState, useEffect, useRef } from 'react';
import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { addChatReaction, getChatReactionSummary, sendChatMessage } from '../api/chat';
import type { ChatMessageResponse, ChatReactionCountResponse } from '../types/chat';

function ChatMessage({ message }: { message: ChatMessageResponse }) {
  const [reactions, setReactions] = useState<ChatReactionCountResponse[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout | null>(null);
  const localName = localStorage.getItem('deviceName');

  // Sprawdź, czy wiadomość jest wysłana przez aktualnego użytkownika
  const isOwn = message.deviceName === localName;

  useEffect(() => {
    // Pobierz podsumowanie reakcji dla wiadomości
    getChatReactionSummary(message.id).then(setReactions);
  }, [message.id]);

  const handleReactionSelect = async (emoji: string) => {
    try {
      await addChatReaction(message.id, { emoji });
      // Po dodaniu reakcji odśwież lokalne podsumowanie reakcji
      setReactions(await getChatReactionSummary(message.id));
    } catch (err) {
      console.error('Błąd dodawania reakcji do wiadomości:', err);
    } finally {
      setShowPicker(false);
    }
  };

  // Pokaż selektor emoji po przytrzymaniu 0.4s
  const handleHoldStart = () => {
    const timeout = setTimeout(() => setShowPicker(true), 400);
    setHoldTimeout(timeout);
  };
  // Anuluj pokazanie selektora jeśli puszczono wcześniej
  const handleHoldEnd = () => {
    if (holdTimeout) clearTimeout(holdTimeout);
  };

  // Lista dostępnych emoji reakcji (pełen zestaw jak w galerii)
  const EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎'];

  return (
      <div
          className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4`}
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
      >
        {/* Pojedynczy dymek wiadomości */}
        <div className={`relative max-w-[80%] p-3 rounded-xl ${isOwn ? 'bg-gold text-white' : 'bg-white text-brown'}`}>
          {!isOwn && (
              <div className="text-xs font-bold mb-1">{message.deviceName}</div>
          )}
          <div>{message.text}</div>
          {/* Selektor emoji (reakcje) wyświetlany po przytrzymaniu wiadomości */}
          {showPicker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg px-3 py-2 flex space-x-2 z-50">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => handleReactionSelect(emoji)}
                        className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                ))}
              </div>
          )}
        </div>
        {/* Podsumowanie reakcji pod wiadomością */}
        {reactions.length > 0 && (
            <div className={`mt-1 text-xs flex space-x-2 ${isOwn ? 'justify-end' : ''}`}>
              {reactions.map(r => (
                  <span key={r.emoji} className="flex items-center space-x-1">
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

  useEffect(() => {
    // Inicjalizacja klienta STOMP (SockJS)
    if (!clientRef.current) {
      clientRef.current = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        reconnectDelay: 5000
      });
    }
    const client = clientRef.current;
    // Funkcja subskrypcji na temat czatu
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
    // Po połączeniu (lub jeśli już połączony) – subskrybuj
    if (client.connected) {
      subscribe();
    } else {
      client.onConnect = subscribe;
      if (!client.active) {
        client.activate();
      }
    }
    // Sprzątanie po odmontowaniu – anuluj subskrypcję
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
      <main className="p-4">
        <h1 className="text-xl font-elegant text-brown text-center mb-4">Czat</h1>
        {/* Obszar wiadomości */}
        <div className="mb-4">
          {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
          ))}
        </div>
        {/* Pole wpisywania nowej wiadomości */}
        <div className="flex items-center space-x-2">
          <input
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-gold"
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Napisz wiadomość..."
          />
          <button
              onClick={handleSend}
              className="px-4 py-2 bg-gold text-white rounded hover:opacity-90"
          >
            Wyślij
          </button>
        </div>
      </main>
  );
};

export default ChatPage;
