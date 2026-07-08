import { useEffect, useState } from 'react';
import { Table, Card, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { logApi } from '../../api/log';
import { OperationLog, QueryParams, PaginatedResponse } from '../../types';

export default function Logs() {
  const [data, setData] = useState<PaginatedResponse<OperationLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 20 });

  useEffect(() => {
    fetchLogs();
  }, [params]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logApi.getLogs(params);
      setData(response.data.data!);
    } finally {
      setLoading(false);
    }
  };

  const actionColorMap: Record<string, string> = {
    LOGIN: 'blue',
    LOGOUT: 'default',
    CREATE_USER: 'green',
    UPDATE_USER: 'orange',
    DELETE_USER: 'red',
  };

  const actionTextMap: Record<string, string> = {
    LOGIN: '登录',
    LOGOUT: '退出登录',
    CREATE_USER: '创建用户',
    UPDATE_USER: '更新用户',
    DELETE_USER: '删除用户',
  };

  const columns: ColumnsType<OperationLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '操作人',
      dataIndex: 'user',
      width: 120,
      render: (user: OperationLog['user']) => user?.username || '-',
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      width: 100,
      render: (action: string) => (
        <Tag color={actionColorMap[action] || 'default'}>
          {actionTextMap[action] || action}
        </Tag>
      ),
    },
    {
      title: '资源',
      dataIndex: 'resource',
      width: 150,
    },
    {
      title: '详情',
      dataIndex: 'detail',
      ellipsis: true,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      width: 120,
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      <Card title="操作日志">
        <Table
          columns={columns}
          dataSource={data?.list || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: data?.pagination.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setParams({ page, pageSize }),
          }}
        />
      </Card>
    </div>
  );
}