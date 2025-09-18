import React, { lazy, Suspense, useState } from 'react';
import { Form, Input, Button, Space, Card, Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBroadcastMessage } from '~/hooks/useBroadcastMessage';
import data from '@emoji-mart/data';
import i18n from '@emoji-mart/data/i18n/pl.json';
import styles from './BroadcastMessageForm.module.css';

const { TextArea } = Input;
const Picker = lazy(() => import('@emoji-mart/react'));

export type EmojiSkin = 1 | 2 | 3 | 4 | 5 | 6;

export interface BaseEmoji {
  id: string;
  name: string;
  colons: string;
  /** Reverse mapping to keyof emoticons */
  emoticons: string[];
  unified: string;
  skin: EmojiSkin | null;
  native: string;
}

interface BroadcastMessageFormProps {
  onSuccess?: () => void;
}

const DEFAULT_EMOJI = '📢';

const BroadcastMessageForm: React.FC<BroadcastMessageFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [form] = Form.useForm();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendBroadcastMessage, loading } = useBroadcastMessage();

  const handleOpenChange = (open: boolean) => {
    setShowEmojiPicker(open);
  };

  const handleSubmit = async (values: {
    title: string;
    message: string;
    url?: string;
    emojiIcon?: string;
  }) => {
    try {
      await sendBroadcastMessage(values);
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const onEmojiSelect = (emoji: BaseEmoji) => {
    try {
      if (emoji && typeof emoji.native === 'string') {
        form.setFieldValue('emojiIcon', emoji.native);
        setShowEmojiPicker(false);
      }
    } catch (error) {
      // Nothing to do
    }
  };

  return (
    <Card title={t('broadcast.title')} className="mb-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ emojiIcon: DEFAULT_EMOJI }}
      >
        <Form.Item
          name="title"
          label={t('broadcast.form.title')}
          rules={[{ required: true, message: t('broadcast.form.titleRequired') }]}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="emojiIcon" noStyle>
              <Popover
                open={showEmojiPicker}
                onOpenChange={handleOpenChange}
                content={
                  <div className={styles['emoji-picker-container']}>
                    <Suspense
                      fallback={
                        <div className="h-[435px] w-[352px] flex items-center justify-center">
                          Loading...
                        </div>
                      }
                    >
                      <Picker
                        data={data}
                        onEmojiSelect={onEmojiSelect}
                        theme="light"
                        i18n={i18n}
                        previewPosition="none"
                        skinTonePosition="none"
                        autoFocus
                      />
                    </Suspense>
                  </div>
                }
                trigger="click"
              >
                <Button type="default" className="w-[48px] text-xl p-0">
                  {form.getFieldValue('emojiIcon') || DEFAULT_EMOJI}
                </Button>
              </Popover>
            </Form.Item>
            <Form.Item name="title" noStyle>
              <Input placeholder={t('broadcast.form.title')} className="!w-[calc(100%-48px)]" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="message"
          label={t('broadcast.form.message')}
          rules={[{ required: true, message: t('common:validationErrors.fieldIsRequired') }]}
        >
          <TextArea rows={4} placeholder={t('broadcast.form.message')} />
        </Form.Item>

        <Form.Item
          name="url"
          label={t('broadcast.form.url')}
          rules={[
            {
              type: 'url',
              message: t('common:validationErrors.invalidUrl'),
            },
          ]}
        >
          <Input placeholder={t('broadcast.form.url')} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('broadcast.form.submit')}
            </Button>
            <Button onClick={() => form.resetFields()}>{t('broadcast.form.reset')}</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BroadcastMessageForm;
