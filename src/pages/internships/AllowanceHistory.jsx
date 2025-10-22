import React, { useState, useEffect } from 'react';
import { getMyAllowanceHistory } from '../../services/allowanceService';
import { Table, Spin, Alert } from 'antd';

const AllowanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getMyAllowanceHistory();
        setHistory(response.data);
      } catch (err) {
        setError('Không thể tải lịch sử phụ cấp.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'applyDate',
      key: 'applyDate',
      render: (text) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Loại phụ cấp',
      dataIndex: 'allowanceType',
      key: 'allowanceType',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => `${text.toLocaleString('vi-VN')} VNĐ`,
    },
  ];

  if (loading) {
    return <Spin tip="Đang tải..." />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <h1>Lịch sử phụ cấp của tôi</h1>
      <Table dataSource={history} columns={columns} rowKey="_id" />
    </div>
  );
};

export default AllowanceHistory;
