import React, { FunctionComponent, useState } from 'react';
import { Alert, Button, Card, Input, message, Popconfirm, Space, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ModalForm from '~/components/ModalForm/ModalForm';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  API_DOCUMENTATION_URL,
  ApiTokenDocument,
  integrationApiTokensActions,
} from '@akademiasaas/shared';
import CreateApiTokenForm, {
  CreateTokenFormData,
} from '~/components/CreateApiTokenForm/CreateApiTokenForm';
import { useLoading } from '~/hooks/useLoading';
import { useAppDispatch } from '~/initializeStore';
import { useUserFeatures } from '~/hooks/useUserFeatures';

interface OwnProps {
  tokens: null | ApiTokenDocument[];
}

type Props = OwnProps;

const ApiIntegration: FunctionComponent<Props> = ({ tokens }) => {
  const { t } = useTranslation(['settings', 'common']);
  const [showModal, toggleModal] = useState(false);
  const [createdToken, setCreatedToken] = useState<null | string>(null);
  const dispatch = useAppDispatch();
  const [loading, startLoading, stopLoading] = useLoading();
  const { api: apiEnabled } = useUserFeatures();

  const handleFormSubmit = async (data: CreateTokenFormData) => {
    startLoading();

    const token = await dispatch(
      integrationApiTokensActions.createApiToken({
        payload: {
          name: data.name,
          expiresIn: data.expiresIn === 'never' ? null : data.expiresIn,
        },
        onFailure: () => {
          message.error(t<string>('settings:apiIntegration.createFailure'));
        },
      })
    ).unwrap();

    toggleModal(false);
    stopLoading();

    setCreatedToken(token);
  };

  const handleDeleteApiKey = async (id: string) => {
    message.loading({
      content: `${t<string>('settings:apiIntegration.deleteProgress')}`,
      key: 'loading',
    });

    await dispatch(
      integrationApiTokensActions.deleteApiToken({
        payload: { id },
        onSuccess: () => {
          message.success(t<string>('settings:apiIntegration.deleteSuccess'));
          message.destroy('loading');
        },
        onFailure: () => {
          message.error(t<string>('settings:apiIntegration.deleteFailure'));
          message.destroy('loading');
        },
      })
    );
  };

  if (!apiEnabled) {
    return (
      <Space direction="vertical" size={24}>
        <Alert message={t<string>('settings:apiIntegration.disabled')} type="warning" showIcon />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={24} className="w-3/4">
      <Card
        title={t<string>('settings:apiIntegration.title')}
        extra={
          <Button type="primary" onClick={() => toggleModal(true)} icon={<PlusOutlined />}>
            {t<string>('settings:apiIntegration.create')}
          </Button>
        }
      >
        {createdToken && (
          <Alert
            style={{ marginBottom: 24 }}
            message={t<string>('settings:apiIntegration.createSuccess')}
            description={
              <div>
                <p>{t<string>('settings:apiIntegration.createSuccessDescription')}</p>
                <Input.TextArea
                  className="my-4"
                  rows={4}
                  value={createdToken}
                  readOnly
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(createdToken);
                    message.success(t<string>('settings:apiIntegration.copySuccess'));
                  }}
                >
                  {t<string>('common:button.copy')}
                </Button>
              </div>
            }
            type="success"
            showIcon
            closable
            onClose={() => setCreatedToken(null)}
          />
        )}
        <Table<ApiTokenDocument>
          loading={tokens === null}
          dataSource={tokens || []}
          scroll={{ x: true }}
          rowKey="id"
          pagination={{
            hideOnSinglePage: true,
          }}
          locale={{
            emptyText: t<string>('settings:apiIntegration.empty'),
          }}
        >
          <Table.Column<ApiTokenDocument>
            title={t<string>('settings:apiIntegration.name')}
            dataIndex="name"
            key="name"
            width={192}
            render={(text) => <span>{text}</span>}
          />
          <Table.Column<ApiTokenDocument>
            title={t<string>('settings:apiIntegration.created')}
            dataIndex="createdAt"
            width={144}
            key="createdAt"
            render={(date) => <span>{dayjs(date).format('DD.MM.YYYY')}</span>}
          />
          <Table.Column<ApiTokenDocument>
            title={t<string>('settings:apiIntegration.expiresAt')}
            dataIndex="expiresAt"
            width={144}
            key="expiresAt"
            render={(date) =>
              date ? (
                <span>{dayjs(date).format('DD.MM.YYYY')}</span>
              ) : (
                <span>{t<string>('settings:apiIntegration.indefinitely')}</span>
              )
            }
          />
          <Table.Column<ApiTokenDocument>
            title={t<string>('settings:apiIntegration.status')}
            width={120}
            render={(_, row) =>
              row.expiresAt ? (
                row.expiresAt > new Date() ? (
                  <span>{t<string>('settings:apiIntegration.active')}</span>
                ) : (
                  <span>{t<string>('settings:apiIntegration.expired')}</span>
                )
              ) : (
                <span>{t<string>('settings:apiIntegration.active')}</span>
              )
            }
          />
          <Table.Column<ApiTokenDocument>
            title={t<string>('common:options')}
            dataIndex="id"
            width={120}
            key="id"
            render={(id) => (
              <Popconfirm
                overlayStyle={{ maxWidth: 400 }}
                placement="leftTop"
                title={t<string>('settings:apiIntegration.deleteWarning')}
                onConfirm={() => handleDeleteApiKey(id)}
              >
                <Button type="link" danger>
                  {t<string>('common:button.delete')}
                </Button>
              </Popconfirm>
            )}
          />
        </Table>

        <div className="pt-4">
          <a target="_blank" rel="noreferrer" href={API_DOCUMENTATION_URL}>
            {t('settings:apiIntegration.instruction.title')}
          </a>
        </div>
        <ModalForm<CreateTokenFormData>
          open={showModal}
          loading={loading}
          onCancel={() => toggleModal(false)}
          title={t<string>('settings:apiIntegration.create')}
          width={900}
        >
          <CreateApiTokenForm onSubmit={handleFormSubmit} />
        </ModalForm>
      </Card>
    </Space>
  );
};

export default ApiIntegration;
