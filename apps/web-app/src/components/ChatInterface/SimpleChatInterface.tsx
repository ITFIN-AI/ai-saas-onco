import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Typography, Spin, Alert, Avatar } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { ChatMessage } from '@akademiasaas/shared';
import { chatService, SendMessageRequest } from '../../services/ChatService';
import { aiChatBotService } from '../../services/AIChatBotService';
import './ChatInterface.scss';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface SimpleChatInterfaceProps {
  onNewMessage?: (message: ChatMessage) => void;
  email?: string;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ 
  onNewMessage,
  email
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(() => {
    const fallbackEmail = email ?? 'anonymous@ai-saas.local';
    return chatService.generateSessionId(fallbackEmail);
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!email) {
      setMessages([]);
      setIsHistoryLoading(false);
      return;
    }

    const nextSessionId = chatService.generateSessionId(email);
    setSessionId(nextSessionId);
    setMessages([]);

    const loadChatHistory = async () => {
      setIsHistoryLoading(true);
      setError(null);

      try {
        const response = await chatService.getChatHistory(nextSessionId, email);

        if (response.success && response.data) {
          setMessages(response.data.messages || []);
        } else {
          setMessages([]);
        }
      } catch (historyError) {
        console.error('Failed to load chat history:', historyError);
        setMessages([]);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadChatHistory();
  }, [email, onNewMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!email) {
      setError('Podaj adres email, aby rozpocząć rozmowę.');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    onNewMessage?.(userMessage);
    
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    const attemptDirectAIResponse = async (): Promise<ChatMessage | null> => {
      try {
        const fallback = await aiChatBotService.sendMessage(messageToSend, { email });

        if (fallback.success && fallback.data) {
          return {
            id: `ai_${Date.now()}`,
            content: fallback.data,
            role: 'assistant',
            timestamp: new Date(),
          };
        }

        console.error('AIChatBotService fallback error:', fallback);
        setError(fallback.message || 'Failed to get response from AI');
        return null;
      } catch (fallbackError) {
        console.error('AIChatBotService fallback exception:', fallbackError);
        setError('Failed to get response from AI');
        return null;
      }
    };

    const appendAssistantMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      onNewMessage?.(message);
    };

    try {
      const request: SendMessageRequest = {
        message: messageToSend,
        email,
        sessionId,
      };

      const response = await chatService.sendMessage(request);

      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          id: response.data.messageId,
          content: response.data.response,
          role: 'assistant',
          timestamp: new Date(),
        };

        appendAssistantMessage(aiMessage);
      } else {
        console.warn('ChatService error, falling back to AIChatBotService:', response);
        const fallbackMessage = await attemptDirectAIResponse();
        if (fallbackMessage) {
          appendAssistantMessage(fallbackMessage);
        }
      }
    } catch (err) {
      console.error('ChatService sendMessage exception, falling back to AIChatBotService:', err);
      const fallbackMessage = await attemptDirectAIResponse();
      if (fallbackMessage) {
        appendAssistantMessage(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isHistoryLoading) {
    return (
      <div className="chat-interface">
        <div className="chat-loading">
          <Spin size="large" />
          <Text>Ładowanie historii czatu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <Text strong>Chat z Asystentem AI</Text>
      </div>

      {error && (
        <Alert
          message="Błąd"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          className="chat-error"
        />
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <RobotOutlined className="empty-icon" />
            <Text type="secondary">
              Rozpocznij rozmowę z asystentem AI. Zadaj pytanie dotyczące radioterapii.
            </Text>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <Avatar
                    icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    size="small"
                    className={message.role === 'user' ? 'user-avatar' : 'ai-avatar'}
                  />
                  <Text type="secondary" className="message-time">
                    {formatTimestamp(message.timestamp)}
                  </Text>
                </div>
                <div className="message-text">
                  <Paragraph className="message-paragraph">
                    {message.content}
                  </Paragraph>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">
              <div className="message-header">
                <Avatar
                  icon={<RobotOutlined />}
                  size="small"
                  className="ai-avatar"
                />
                <Text type="secondary" className="message-time">
                  Teraz
                </Text>
              </div>
              <div className="message-text">
                <Spin size="small" />
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Asystent pisze...
                </Text>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={email ? 'Zadaj pytanie dotyczące radioterapii...' : 'Podaj email, aby rozpocząć rozmowę'}
          rows={2}
          disabled={isLoading || !email}
          className="message-input"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={isLoading}
          disabled={!inputMessage.trim() || !email}
          className="send-button"
        >
          Wyślij
        </Button>
      </div>
    </div>
  );
};

export default SimpleChatInterface;

