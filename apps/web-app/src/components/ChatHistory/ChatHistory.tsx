import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Button, Tag, Empty, Spin } from 'antd';
import { MessageOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { ChatSessionDocument, ChatHistoryDocument, ChatHistorySession } from '@akademiasaas/shared';
import { chatService } from '../../services/ChatService';
import './ChatHistory.scss';

const { Title, Text, Paragraph } = Typography;

interface ChatHistoryProps {
  email: string;
  onSessionSelect?: (sessionId: string) => void;
  selectedSessionId?: string;
}

// Using ChatHistorySession from shared models

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  email, 
  onSessionSelect, 
  selectedSessionId 
}) => {
  const [sessions, setSessions] = useState<ChatHistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChatSessions();
  }, [email]);

  const loadChatSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.getChatHistoryFromPostgres(email);
      
      if (response.success && response.data) {
        setSessions(response.data.sessions || []);
      } else {
        setError(response.message || 'Nie udało się załadować historii czatu');
        setSessions([]);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      setError('Nie udało się załadować historii czatu');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Przed chwilą';
    } else if (diffInHours < 24) {
      return `${diffInHours}h temu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} dni temu`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktywna';
      case 'completed':
        return 'Zakończona';
      case 'archived':
        return 'Archiwizowana';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="chat-history">
        <div className="chat-history-header">
          <Title level={4}>Historia Rozmów</Title>
        </div>
        <div className="chat-history-loading">
          <Spin size="large" />
          <Text type="secondary">Ładowanie historii...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-history">
        <div className="chat-history-header">
          <Title level={4}>Historia Rozmów</Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadChatSessions}
            size="small"
          >
            Odśwież
          </Button>
        </div>
        <div className="chat-history-error">
          <Text type="danger">{error}</Text>
          <Button 
            type="link" 
            onClick={loadChatSessions}
            icon={<ReloadOutlined />}
          >
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history">
      <div className="chat-history-header">
        <Title level={4}>Historia Rozmów</Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadChatSessions}
          size="small"
        >
          Odśwież
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="chat-history-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">
                Brak historii rozmów. Rozpocznij nową rozmowę.
              </Text>
            }
          />
        </div>
      ) : (
        <div className="chat-history-list">
          <List
            dataSource={sessions}
            renderItem={(session) => (
              <List.Item
                className={`chat-history-item ${
                  selectedSessionId === session.session_id ? 'selected' : ''
                }`}
                onClick={() => onSessionSelect?.(session.session_id)}
              >
                <Card 
                  size="small" 
                  className="session-card"
                  hoverable
                >
                  <div className="session-header">
                    <div className="session-info">
                      <Text strong className="session-id">
                        Sesja #{session.session_id.slice(-8)}
                      </Text>
                      <Tag 
                        color={getStatusColor(session.status)}
                        className="session-status"
                      >
                        {getStatusText(session.status)}
                      </Tag>
                    </div>
                    <div className="session-meta">
                      <Text type="secondary" className="session-time">
                        <ClockCircleOutlined /> {formatDate(session.last_activity)}
                      </Text>
                    </div>
                  </div>
                  
                  <div className="session-preview">
                    <Paragraph 
                      ellipsis={{ rows: 2 }}
                      className="session-message"
                    >
                      {session.first_message || 'Brak wiadomości'}
                    </Paragraph>
                  </div>
                  
                  <div className="session-footer">
                    <Text type="secondary" className="session-count">
                      <MessageOutlined /> {session.message_count} wiadomości
                    </Text>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
