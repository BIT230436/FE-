import React from 'react';

export default function StatusBadgeExtended({ status, type = 'document' }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          text: 'Chờ duyệt',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳'
        };
      case 'ACCEPTING':
        return {
          text: 'Đang duyệt',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '🔄'
        };
      case 'REJECTING':
        return {
          text: 'Đang từ chối',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🔄'
        };
      case 'APPROVED':
        return {
          text: 'Đã duyệt',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅'
        };
      case 'REJECTED':
        return {
          text: 'Đã từ chối',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌'
        };
      case 'CONFIRMED':
        return {
          text: 'Đã xác nhận',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '📋'
        };
      default:
        return {
          text: status || 'Không xác định',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
}
