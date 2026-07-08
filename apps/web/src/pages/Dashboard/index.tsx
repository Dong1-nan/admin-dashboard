import { useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  FileTextOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { userApi } from '../../api/user';
import { useState } from 'react';
import { DashboardStats } from '../../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await userApi.getStats();
      setStats(response.data.data!);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据看板</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats?.totalUsers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats?.activeUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="管理员"
              value={stats?.adminUsers || 0}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="操作日志"
              value={stats?.totalLogs || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="近7天新增"
              value={stats?.recentUsers || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>系统说明</h3>
        <p>这是一个企业级后台管理系统示例项目，用于学习和实践现代全栈开发的完整流程。</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>前端：React 18 + TypeScript + Ant Design</li>
          <li>后端：Node.js + Express + Prisma</li>
          <li>数据库：PostgreSQL</li>
          <li>认证：JWT Token</li>
          <li>部署：Docker + Docker Compose</li>
        </ul>
      </Card>
    </div>
  );
}