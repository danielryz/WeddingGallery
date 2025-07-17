// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef, type UIEvent } from 'react';
import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  addChatReaction,
  getChatReactionSummary,
  sendChatMessage,
  getChatMessages
} from '../api/chat';
import type { ChatMessageResponse, ChatReactionCountResponse } from '../types/chat';
import './ChatPage.css';
import { useAlerts } from "../components/alert/useAlerts"
import ReactionSelector from '../components/Reactions/ReactionSelector';
import ReactionSummary from '../components/Reactions/ReactionSummary';
import useLongPressReaction from '../hooks/useLongPressReaction';

function ChatMessage({ message }: { message: ChatMessageResponse }) {
  const [reactions, setReactions] = useState<ChatReactionCountResponse[]>([]);
  const { show: showPicker, handlers, close } = useLongPressReaction();
  const pickerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const localDeviceId = Number(localStorage.getItem('deviceId'));
  const isOwn = message.deviceId === localDeviceId;

  const showAlert = useAlerts();

  useEffect(() => {
    getChatReactionSummary(message.id).then(setReactions);
  }, [message.id]);

  // klik poza picker → ukryj
  useEffect(() => {
    const onClickOutside = (e: Event) => {
      if (showPicker && pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('touchstart', onClickOutside);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('touchstart', onClickOutside);
    };
  }, [showPicker, close]);

  const handleReactionSelect = async (emoji: string) => {
    try {
      await addChatReaction(message.id, { emoji });
      setReactions(await getChatReactionSummary(message.id));
    } catch (err) {
      showAlert('Błąd dodawania reakcji: ' + err, 'error');
    } finally {
      close();
    }
  };


  return (
      <div className={`chat-message ${isOwn ? 'own' : ''}`}>
        <div
            className={`chat-bubble ${isOwn ? 'own' : 'other'}`}
            {...handlers}
            ref={bubbleRef}
        >
          {!isOwn && <div className="chat-sender-name">{message.deviceName}</div>}
          <div>{message.text}</div>
        </div>

        {showPicker && (
            <div ref={pickerRef} className="emoji-picker">
              <ReactionSelector
                triggerRef={bubbleRef}
                onClose={close}
                addReactionFn={handleReactionSelect}
              />
            </div>
        )}

        <ReactionSummary
            reactions={Object.fromEntries(reactions.map(r => [r.emoji, r.count]))}
            className={isOwn ? 'own' : undefined}
        />
      </div>
  );
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [text, setText] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isPrependingRef = useRef<boolean>(false);
  const subRef = useRef<StompSubscription | null>(null);
  const clientRef = useRef<Client | null>(null);
  const sizePerPage = 100;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const showAlert = useAlerts();
  // 1) Pobierz pierwszą stronę
  useEffect(() => {
    (async () => {
      try {
        const page = await getChatMessages(0, sizePerPage);
        setMessages(page.content);
        setHasMore(!page.last);
      } catch (err) {
        showAlert('Błąd pobierania historii: ' + err, 'error');
      }
    })();
  }, [sizePerPage, showAlert]);

  // 2) Infinite scroll: doładowanie starszych z utrzymaniem scrolla
  const onScroll = async (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop === 0 && hasMore && containerRef.current) {
      isPrependingRef.current = true;
      prevScrollHeightRef.current = containerRef.current.scrollHeight;

      try {
        const nextPage = pageNumber + 1;
        const page = await getChatMessages(nextPage, sizePerPage);
        setMessages(prev => [...page.content, ...prev]);
        setPageNumber(nextPage);
        if (page.last) setHasMore(false);
      } catch (err) {
        showAlert('Błąd ładowania kolejnej strony: ' + err, 'error');
      }
    }
  };

  // 3) Po prepend, skoryguj scroll
  useEffect(() => {
    if (isPrependingRef.current && containerRef.current) {
      const delta = containerRef.current.scrollHeight - prevScrollHeightRef.current;
      containerRef.current.scrollTop = delta;
      isPrependingRef.current = false;
    }
  }, [messages]);

  // 4) STOMP subskrypcja nowych
  useEffect(() => {
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
          showAlert('Błąd parsowania: ' + err, 'error');
        }
      });
    };
    if (client.connected) {
      subscribe();
    } else {
      client.onConnect = subscribe;
      if (!client.active) client.activate();
    }
    return () => {
      subRef.current?.unsubscribe();
    };
  }, [API_URL, showAlert]);

  // 5) Scroll do dołu po nowej wiadomości (tylko gdy nie prepend)
  useEffect(() => {
    if (!isPrependingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendChatMessage({ text });
      setText('');
    } catch (err) {
      console.error('Błąd wysyłania:', err);
    }
  };

  return (
      <main className="chat-page" onClick={() => {/* klik poza chat-message nie będzie kolidował */}}>
        <h1 className="chat-title">Czat</h1>
        <div className="chat-messages" ref={containerRef} onScroll={onScroll}>
          {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input
              className="chat-input"
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Napisz wiadomość..."
          />
          <button onClick={handleSend} className="btn btn-primary">
            Wyślij
          </button>
        </div>
      </main>
  );
};

export default ChatPage;
