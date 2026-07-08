import { Form, Input, Button, Card, message } from 'antd';
import { useState } from 'react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth';
import { ChangePasswordInput } from '../../types';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (values: ChangePasswordInput) => {
    try {
      setLoading(true);
      await authApi.changePassword(values);
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Card title="个人信息" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div>
            <p><strong>用户名：</strong>{user?.username}</p>
            <p><strong>昵称：</strong>{user?.nickname || '未设置'}</p>
            <p><strong>邮箱：</strong>{user?.email}</p>
            <p><strong>角色：</strong>{user?.role === 'ADMIN' ? '管理员' : '普通用户'}</p>
            <p>
              <strong>状态：</strong>
              <span style={{ color: user?.status === 'ACTIVE' ? '#52c41a' : '#ff4d4f' }}>
                {user?.status === 'ACTIVE' ? '正常' : '禁用'}
              </span>
            </p>
          </div>
        </div>
      </Card>

      <Card title="修改密码">
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[
              { required: true, message: '请输入原密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}