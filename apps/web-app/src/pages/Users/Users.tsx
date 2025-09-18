import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Typography,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Avatar,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2023-06-15 09:23',
        createdAt: '2023-01-10',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        status: 'active',
        lastLogin: '2023-06-14 15:45',
        createdAt: '2023-02-20',
      },
      {
        id: '3',
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        role: 'editor',
        status: 'inactive',
        lastLogin: '2023-05-30 11:20',
        createdAt: '2023-03-05',
      },
      {
        id: '4',
        name: 'Sarah Williams',
        email: 'sarah.williams@example.com',
        role: 'user',
        status: 'pending',
        lastLogin: 'Never',
        createdAt: '2023-06-10',
      },
      {
        id: '5',
        name: 'Thomas Wilson',
        email: 'thomas.wilson@example.com',
        role: 'editor',
        status: 'active',
        lastLogin: '2023-06-12 13:15',
        createdAt: '2023-04-15',
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 800); // Simulate API delay
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const showAddModal = () => {
    setModalMode('add');
    setCurrentUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (user: User) => {
    setModalMode('edit');
    setCurrentUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      // In a real app, you would call an API here
      setUsers(users.filter((user) => user.id !== userToDelete));
      messageApi.success(t('dashboard:users.userDeleted'));
      setIsDeleteModalVisible(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (modalMode === 'add') {
        // In a real app, you would call an API here
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: values.name,
          email: values.email,
          role: values.role,
          status: values.status,
          lastLogin: 'Never',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers([...users, newUser]);
        messageApi.success(t('dashboard:users.userAdded'));
      } else if (modalMode === 'edit' && currentUser) {
        // In a real app, you would call an API here
        const updatedUsers = users.map((user) =>
          user.id === currentUser.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        messageApi.success(t('dashboard:users.userUpdated'));
      }
      setIsModalVisible(false);
    });
  };

  const handleResetPassword = (_userId: string) => {
    // In a real app, you would call an API here
    messageApi.success(t('dashboard:users.passwordResetSent'));
  };

  const columns = [
    {
      title: t('dashboard:users.columns.user'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: User) => (
        <div className="flex items-center">
          <Avatar style={{ backgroundColor: record.status === 'active' ? '#87d068' : '#f56a00' }}>
            {text.charAt(0)}
          </Avatar>
          <div className="ml-2">
            <div>{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('dashboard:users.columns.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'editor' ? 'blue' : 'default'}>
          {t(`dashboard:users.roles.${role}`)}
        </Tag>
      ),
    },
    {
      title: t('dashboard:users.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'default' : 'orange'}>
          {t(`dashboard:users.statuses.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('dashboard:users.columns.lastLogin'),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: t('dashboard:users.columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: t('dashboard:users.columns.actions'),
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title={t('common:edit')}>
            <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: t('dashboard:users.actions.resetPassword'),
                  icon: <LockOutlined />,
                  onClick: () => handleResetPassword(record.id),
                },
                {
                  key: '2',
                  label: t('common:delete'),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
              ],
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('dashboard:users.title')}</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={showAddModal}>
          {t('dashboard:users.addUser')}
        </Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4 flex justify-between">
          <Input
            placeholder={t('dashboard:users.searchUsers')}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space>
            <Button icon={<FilterOutlined />}>{t('common:button.filter')}</Button>
          </Space>
        </div>

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t('common:pagination.of')} ${total} ${t('common:pagination.items')}`,
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'add' ? t('dashboard:users.addUser') : t('dashboard:users.editUser')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={modalMode === 'add' ? t('common:add') : t('common:save')}
        cancelText={t('common:button.cancel')}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label={t('common:name')}
            rules={[{ required: true, message: t('dashboard:users.validation.nameRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('common:email')}
            rules={[
              { required: true, message: t('dashboard:users.validation.emailRequired') },
              { type: 'email', message: t('dashboard:users.validation.emailInvalid') },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label={t('dashboard:users.columns.role')}
            rules={[{ required: true, message: t('dashboard:users.validation.roleRequired') }]}
          >
            <Select>
              <Option value="admin">{t('dashboard:users.roles.admin')}</Option>
              <Option value="editor">{t('dashboard:users.roles.editor')}</Option>
              <Option value="user">{t('dashboard:users.roles.user')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label={t('dashboard:users.columns.status')}
            rules={[{ required: true, message: t('dashboard:users.validation.statusRequired') }]}
          >
            <Select>
              <Option value="active">{t('dashboard:users.statuses.active')}</Option>
              <Option value="inactive">{t('dashboard:users.statuses.inactive')}</Option>
              <Option value="pending">{t('dashboard:users.statuses.pending')}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        title={t('dashboard:users.confirmDelete')}
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText={t('common:delete')}
        okType="danger"
        cancelText={t('common:cancel')}
      >
        <p>{t('dashboard:users.deleteWarning')}</p>
      </Modal>
    </>
  );
};

export default Users;
