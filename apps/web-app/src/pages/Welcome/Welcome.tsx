import React, { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { MailOutlined, KeyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './Welcome.scss';
import nioLogo from '../../assets/images/nio_logo_200-1.png';
import SimpleChatInterface from '../../components/ChatInterface/SimpleChatInterface';
import accessCodesData from './access-codes.json';

const { Title, Text, Paragraph } = Typography;

interface WelcomeFormData {
  email: string;
  code: string;
}

type FormStep = 'welcome' | 'terms' | 'chat';

const Welcome: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WelcomeFormData | null>(null);

  const validateAccessCode = (code: string): boolean => {
    const normalizedCode = accessCodesData.validationRules.caseSensitive 
      ? code 
      : code.toUpperCase();
    
    return accessCodesData.accessCodes.some(accessCode => {
      const normalizedAccessCode = accessCodesData.validationRules.caseSensitive
        ? accessCode.code
        : accessCode.code.toUpperCase();
      
      return normalizedAccessCode === normalizedCode && accessCode.active;
    });
  };

  const handleStart = async (values: WelcomeFormData) => {
    setIsLoading(true);
    
    // Validate the access code
    if (!validateAccessCode(values.code)) {
      setIsLoading(false);
      message.error('Nieprawidłowy kod dostępu. Sprawdź kod i spróbuj ponownie.');
      return;
    }
    
    setFormData(values);
    
    // Simulate API call for validation
    setTimeout(() => {
      setIsLoading(false);
      message.success('Kod dostępu zaakceptowany!');
      setCurrentStep('terms');
    }, 1000);
  };

  const handleAcceptTerms = () => {
    // Go directly to chat
    setCurrentStep('chat');
  };

  return (
    <div className="welcome-container">
      {/* Top Right Logo */}
      <div className="top-right-logo">
        <img 
          src={nioLogo} 
          alt="National Research Institute of Oncology" 
          className="nio-logo-large"
        />
      </div>

      {/* Left Sidebar */}
      <div className="sidebar">
        {/* NIO Logo */}
        <div className="sidebar-logo">
          <img 
            src={nioLogo} 
            alt="National Research Institute of Oncology" 
            className="nio-logo"
          />
        </div>
        
        {/* FAQ Section */}
        <div className="faq-section">
          <p className="faq-title">Najczęściej zadawane pytania:</p>
          <ul className="faq-list">
            <li>Pytanie 1</li>
            <li>Pytanie 2</li>
            <li>Pytanie 3</li>
            <li>Pytanie 4</li>
          </ul>
        </div>
        
        {/* Bottom Links */}
        <div className="sidebar-footer">
          <a href="#" className="footer-link">Pomoc</a>
          <a href="#" className="footer-link">O nas</a>
        </div>
      </div>
      
      <div className="main-content">
        <div className="welcome-content">
        {/* Header */}
        <div className="welcome-header">
          <Title level={1} className="welcome-title">
            AI Oncology Assistant
          </Title>
          <Text className="welcome-subtitle">
            Zaawansowane wsparcie w diagnostyce onkologicznej
          </Text>
        </div>

        {/* Welcome Form Section */}
        <div className={`form-section ${currentStep === 'welcome' ? 'slide-in' : 'slide-out'}`}>
          {currentStep === 'welcome' && (
            <div className="welcome-form">
              <div className="form-header">
                <Title level={2} className="form-title">
                  Witamy w systemie
                </Title>
                <Text className="form-description">
                  Wprowadź swoje dane aby rozpocząć konsultację
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleStart}
                className="welcome-form-fields"
                size="large"
              >
                <Form.Item
                  name="email"
                  label="Adres email"
                  rules={[
                    { required: true, message: 'Proszę wprowadzić adres email' },
                    { type: 'email', message: 'Proszę wprowadzić prawidłowy adres email' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="input-icon" />}
                    placeholder="twoj.email@example.com"
                    className="welcome-input"
                  />
                </Form.Item>

                <Form.Item
                  name="code"
                  label="Kod dostępu"
                  rules={[
                    { required: true, message: 'Proszę wprowadzić kod dostępu' },
                    { min: 6, message: 'Kod musi mieć co najmniej 6 znaków' },
                    {
                      validator: (_, value) => {
                        if (!value || value.length < 6) {
                          return Promise.resolve();
                        }
                        if (validateAccessCode(value)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Nieprawidłowy kod dostępu'));
                      }
                    }
                  ]}
                >
                  <Input
                    prefix={<KeyOutlined className="input-icon" />}
                    placeholder="Wprowadź kod dostępu"
                    className="welcome-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    className="start-button"
                    block
                  >
                    Rozpocznij
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </div>

        {/* Terms Section */}
        <div className={`terms-section ${currentStep === 'terms' ? 'slide-in' : 'slide-out'}`}>
          {currentStep === 'terms' && (
            <div className="terms-form">
              <div className="terms-header">
                <CheckCircleOutlined className="terms-icon" />
                <Title level={2} className="terms-title">
                  Regulamin i warunki korzystania
                </Title>
              </div>

              <div className="terms-content">
                <Paragraph className="terms-text">
                  Witaj w inteligentym czacie Zakładu Radioterapii I Narodowego Instytutu Onkologii w Warszawie. 
                  Jestem tu po to aby rozwiązać twoje wątpliwości dotyczące Twojego leczenia w Zakładzie Radioterapii. 
                  Nie zastępuję profesjonalnej porady medycznej. Pamiętaj, w razie poważnych objawów lub wątpliwości 
                  zawsze skonsultuj się z lekarzem. W nagłych wypadkach zadzwoń pod numer <strong>112</strong> lub <strong>999</strong>. 
                  Kliknij w przycisk potwierdzam jeżeli zaznajomiłeś się z tym komunikatem.
                </Paragraph>
              </div>

              <div className="terms-actions">
                <Button
                  type="primary"
                  onClick={handleAcceptTerms}
                  className="confirm-button"
                  block
                >
                  Potwierdzam
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className={`chat-section ${currentStep === 'chat' ? 'slide-in' : 'slide-out'}`}>
          {currentStep === 'chat' && formData && (
            <div className="chat-form">
              <div className="chat-header">
                <Title level={2} className="chat-title">
                  Chat z Asystentem AI
                </Title>
                <Text className="chat-description">
                  Rozpocznij rozmowę z inteligentnym asystentem onkologicznym
                </Text>
              </div>

              <div className="chat-interface-container">
                <SimpleChatInterface />
              </div>
            </div>
          )}
        </div>

        </div>
        
        {/* Bottom Separator and Info */}
        <div className="bottom-separator">
          <div className="bottom-info">
            <Text className="disclaimer-text">
              Ten chat jest obsługiwany przez bota i nie zastępuje profesjonalnej porady medycznej. W przypadku poważnych objawów, nagłych 
              przypadków lub wątpliwości zawsze skonsultuj się z lekarzem. W nagłych przypadkach natychmiast zadzwoń pod numer 999 lub 112
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
