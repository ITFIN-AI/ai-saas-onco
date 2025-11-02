import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Typography, Spin, Alert, Card, Avatar } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { ChatMessage } from '@akademiasaas/shared';
import { chatService, SendMessageRequest } from '../../services/ChatService';
import './ChatInterface.scss';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface ChatInterfaceProps {
  email: string;
  sessionId: string;
  onHistoryLoaded?: (messages: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  email, 
  sessionId, 
  onHistoryLoaded 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, [sessionId, email]);

  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    setError(null);

    try {
      const response = await chatService.getChatHistory(sessionId, email);
      
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
        onHistoryLoaded?.(response.data.messages || []);
      } else {
        // If no history exists, that's okay - start with empty messages
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const request: SendMessageRequest = {
        message: inputMessage.trim(),
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

        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(response.message || 'Failed to send message');
        // Remove the user message if sending failed
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
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

  if (isLoadingHistory) {
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
        <Text type="secondary">Sesja: {sessionId.slice(-8)}</Text>
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
          placeholder="Zadaj pytanie dotyczące radioterapii..."
          rows={2}
          disabled={isLoading}
          className="message-input"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={isLoading}
          disabled={!inputMessage.trim()}
          className="send-button"
        >
          Wyślij
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
