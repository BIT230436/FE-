import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import InternSelectionModal from "../../components/common/InternSelectionModal";
import {
  createAllowance,
  getAllowances,
} from "../../services/allowanceService";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function AllowanceManagement() {
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function loadAllowances() {
      try {
        const data = await getAllowances();
        setAllowances(data);
      } catch (error) {
        console.error("Failed to load allowances:", error);
        toast.error("Không thể tải danh sách phụ cấp!");
      } finally {
        setLoading(false);
      }
    }
    loadAllowances();
  }, []);

  const handleCreateAllowance = async (newAllowance) => {
    try {
      await createAllowance(newAllowance);
      toast.success("Thêm phụ cấp thành công! 🎉");
      const data = await getAllowances(); // Tải lại danh sách
      setAllowances(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create allowance:", error);
      toast.error(error.response?.data?.message || "Thêm phụ cấp thất bại!");
    }
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-header">
        <h1 className="page-title">Quản lý Phụ cấp</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          Thêm phụ cấp mới
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">Tên Thực tập sinh</th>
              <th className="table-th">Loại phụ cấp</th>
              <th className="table-th">Số tiền</th>
              <th className="table-th">Ngày áp dụng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="table-td center">
                  Đang tải...
                </td>
              </tr>
            ) : allowances.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-td center">
                  Chưa có dữ liệu phụ cấp.
                </td>
              </tr>
            ) : (
              allowances.map((item, index) => (
                <tr key={item.id}>
                  <td className="table-td">{index + 1}</td>
                  <td className="table-td">{item.internName}</td>
                  <td className="table-td">{item.allowanceType}</td>
                  <td className="table-td">
                    {item.amount.toLocaleString("vi-VN")} VND
                  </td>
                  <td className="table-td">{formatDate(item.applyDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateAllowanceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAllowance}
        />
      )}
    </div>
  );
}

function CreateAllowanceModal({ onClose, onCreate }) {
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [allowanceType, setAllowanceType] = useState("Ăn trưa");
  const [amount, setAmount] = useState("");
  const [applyDate, setApplyDate] = useState("");
  const [showInternModal, setShowInternModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!selectedIntern) errors.intern = "Vui lòng chọn thực tập sinh";
    if (!allowanceType) errors.type = "Vui lòng chọn loại phụ cấp";
    if (!amount || amount <= 0) errors.amount = "Số tiền phải là số dương";
    if (!applyDate) errors.date = "Vui lòng chọn ngày áp dụng";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    onCreate({
      internId: selectedIntern?.intern_id || selectedIntern?.id,
      internName: selectedIntern?.student,
      allowanceType,
      amount,
      applyDate,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Thêm Phụ cấp cho Thực tập sinh</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="intern-select">Thực tập sinh *</label>
            <div className="input-with-button">
              <input
                id="intern-select"
                type="text"
                className={`form-input ${
                  validationErrors.intern ? "input-error" : ""
                }`}
                readOnly
                value={
                  selectedIntern
                    ? `${selectedIntern.student} (${selectedIntern.studentEmail})`
                    : ""
                }
                placeholder="Chọn một thực tập sinh từ danh sách"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowInternModal(true)}
              >
                Chọn
              </button>
            </div>
            {validationErrors.intern && (
              <div className="error-message">{validationErrors.intern}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="allowance-type">Loại phụ cấp *</label>
            <select
              id="allowance-type"
              className={`form-input ${
                validationErrors.type ? "input-error" : ""
              }`}
              value={allowanceType}
              onChange={(e) => setAllowanceType(e.target.value)}
            >
              <option value="Ăn trưa">Phụ cấp ăn trưa</option>
              <option value="Đi lại">Phụ cấp đi lại</option>
              <option value="Chuyên cần">Phụ cấp chuyên cần</option>
              <option value="Khác">Khác</option>
            </select>
            {validationErrors.type && (
              <div className="error-message">{validationErrors.type}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Số tiền (VND) *</label>
              <input
                id="amount"
                type="number"
                className={`form-input ${
                  validationErrors.amount ? "input-error" : ""
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ví dụ: 500000"
              />
              {validationErrors.amount && (
                <div className="error-message">{validationErrors.amount}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="apply-date">Ngày áp dụng *</label>
              <input
                id="apply-date"
                type="date"
                className={`form-input ${
                  validationErrors.date ? "input-error" : ""
                }`}
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
              />
              {validationErrors.date && (
                <div className="error-message">{validationErrors.date}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
      {showInternModal && (
        <InternSelectionModal
          onClose={() => setShowInternModal(false)}
          onSelect={(intern) => {
            setSelectedIntern(intern);
            setShowInternModal(false);
          }}
        />
      )}
    </div>
  );
}

CreateAllowanceModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};
