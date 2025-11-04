// Mock data cho báo cáo chuyên cần
const mockAttendanceData = [
  {
    id: 1,
    employeeId: 'NV101',
    fullName: 'Nguyễn Văn An',
    department: 'Phát triển phần mềm',
    workingDays: 20,
    leaveDays: 2,
    lateDays: 1,
    absentDays: 0,
    status: 'Tốt',
    position: 'Thực tập sinh'
  },
  {
    id: 2,
    employeeId: 'NV102',
    fullName: 'Trần Thị Bình',
    department: 'Thiết kế',
    workingDays: 18,
    leaveDays: 1,
    lateDays: 0,
    absentDays: 1,
    status: 'Khá',
    position: 'Thực tập sinh'
  },
  {
    id: 3,
    employeeId: 'NV103',
    fullName: 'Lê Văn Cường',
    department: 'Phát triển phần mềm',
    workingDays: 22,
    leaveDays: 0,
    lateDays: 0,
    absentDays: 0,
    status: 'Xuất sắc',
    position: 'Thực tập sinh'
  },
  {
    id: 4,
    employeeId: 'NV104',
    fullName: 'Phạm Thị Dung',
    department: 'Nhân sự',
    workingDays: 15,
    leaveDays: 5,
    lateDays: 3,
    absentDays: 2,
    status: 'Trung bình',
    position: 'Thực tập sinh'
  },
  {
    id: 5,
    employeeId: 'NV105',
    fullName: 'Hoàng Văn Đạt',
    department: 'Phát triển phần mềm',
    workingDays: 19,
    leaveDays: 1,
    lateDays: 2,
    absentDays: 0,
    status: 'Tốt',
    position: 'Thực tập sinh'
  },
  {
    id: 6,
    employeeId: 'NV106',
    fullName: 'Vũ Thị Hà',
    department: 'Thiết kế',
    workingDays: 21,
    leaveDays: 0,
    lateDays: 1,
    absentDays: 0,
    status: 'Xuất sắc',
    position: 'Thực tập sinh'
  },
  {
    id: 7,
    employeeId: 'NV107',
    fullName: 'Đặng Văn Hùng',
    department: 'Kế toán',
    workingDays: 16,
    leaveDays: 3,
    lateDays: 4,
    absentDays: 1,
    status: 'Trung bình',
    position: 'Thực tập sinh'
  },
  {
    id: 8,
    employeeId: 'NV108',
    fullName: 'Bùi Thị Hương',
    department: 'Marketing',
    workingDays: 17,
    leaveDays: 2,
    lateDays: 2,
    absentDays: 1,
    status: 'Khá',
    position: 'Thực tập sinh'
  }
];

const AttendanceService = {
  // Lấy danh sách báo cáo chuyên cần
  async getAttendanceReport(filters = {}) {
    try {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Lọc dữ liệu dựa trên bộ lọc
      let filteredData = [...mockAttendanceData];
      
      if (filters.searchText) {
        const searchText = filters.searchText.toLowerCase();
        filteredData = filteredData.filter(emp => 
          emp.fullName.toLowerCase().includes(searchText) || 
          emp.employeeId.toLowerCase().includes(searchText)
        );
      }
      
      if (filters.group) {
        filteredData = filteredData.filter(emp => 
          emp.department === filters.group
        );
      }
      
      return filteredData;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu chuyên cần:', error);
      return mockAttendanceData; // Trả về dữ liệu mẫu nếu có lỗi
    }
  },

  // Xuất báo cáo ra Excel (mô phỏng)
  async exportToExcel(filters = {}) {
    try {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Tạo một file Excel giả lập
      const data = await this.getAttendanceReport(filters);
      const csvContent = [
        ['Mã NV', 'Họ và tên', 'Phòng ban', 'Ngày làm việc', 'Nghỉ phép', 'Đi muộn', 'Vắng mặt', 'Đánh giá'],
        ...data.map(emp => [
          emp.employeeId,
          emp.fullName,
          emp.department,
          emp.workingDays,
          emp.leaveDays,
          emp.lateDays,
          emp.absentDays,
          emp.status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_chuyen_can_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      throw error;
    }
  }
};

export default AttendanceService;