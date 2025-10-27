import React, { useState, useEffect } from 'react';
import { getMyAllowanceHistory } from '../../services/allowanceService';
import { Table, Spin, Alert } from 'antd';
import { useAuthStore } from '../../store/authStore';

const AllowanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // ✅ Lấy user từ authStore
        const currentUser = useAuthStore.getState().user;

        console.log('🔍 Current user:', currentUser); // ✅ DEBUG

        if (!currentUser) {
          setError('Vui lòng đăng nhập để xem lịch sử phụ cấp.');
          setLoading(false);
          return;
        }

        if (!currentUser.email) {
          console.error('❌ User không có email:', currentUser);
          setError('Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        console.log('📧 Fetching allowance history for email:', currentUser.email);

        const response = await getMyAllowanceHistory(currentUser.email);

        console.log('✅ Response from backend:', response);

        if (response.success && response.data) {
          setHistory(response.data);
        } else {
          setError('Không có dữ liệu phụ cấp.');
        }

      } catch (err) {
        console.error('❌ Error:', err);
        console.error('❌ Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Không thể tải lịch sử phụ cấp.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const columns = [
    {
      title: 'Ngày áp dụng',
      dataIndex: 'applyDate',
      key: 'applyDate',
      render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Loại phụ cấp',
      dataIndex: 'allowanceType',
      key: 'allowanceType',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(text || 0),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : '-',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Lịch sử phụ cấp của tôi</h1>
      {history.length === 0 ? (
        <Alert message="Bạn chưa có phụ cấp nào được duyệt" type="info" showIcon />
      ) : (
        <Table
          dataSource={history}
          columns={columns}
          rowKey="allowanceId"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default AllowanceHistory;