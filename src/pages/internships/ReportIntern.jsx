import React, { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  ClipboardList,
  User,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  getEvaluationsByUser,
  getReportsByUser,
} from "../../services/reportService";

// Import file CSS mới
import "./ReportIntern.css";

export default function InternViewReports() {
  const [evaluations, setEvaluations] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      setError("");

      // Load cả 2 loại report song song sử dụng service mới
      const [evalData, reportData] = await Promise.all([
        getEvaluationsByUser(),
        getReportsByUser(),
      ]);

      setEvaluations(evalData || []);
      setReports(reportData || []);
    } catch (err) {
      setError("Không thể tải dữ liệu đánh giá");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 8) return "excellent";
    if (score >= 6) return "good";
    if (score >= 4) return "average";
    return "poor";
  };

  const calculateAverageScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return (total / scores.length).toFixed(1);
  };

  return (
    <div className="intern-reports-page">
      {/* Khối <style> đã được xóa khỏi đây */}

      <div className="container">
        {/* Header Section */}
        <div className="header-card">
          <div className="header-title">
            <div className="header-icon">
              <User />
            </div>
            <div className="header-text">
              <h1>Đánh Giá Của Tôi</h1>
              <p>Xem các đánh giá định kỳ và báo cáo cuối kỳ</p>
            </div>
          </div>

          <button
            onClick={loadAllReports}
            className="btn-refresh"
            disabled={loading}
          >
            <RefreshCw className={loading ? "spinning" : ""} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Đang tải dữ liệu...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Mentor Evaluations Section */}
            <div className="evaluations-section">
              <div className="section-header">
                <h2 className="section-title">
                  <ClipboardList />
                  Đánh Giá Định Kỳ Từ Mentor
                  <span className="count-badge">{evaluations.length}</span>
                </h2>
              </div>

              {evaluations.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList />
                  <p>Chưa có đánh giá định kỳ</p>
                  <small>Mentor sẽ đánh giá bạn theo từng kỳ</small>
                </div>
              ) : (
                <div className="reports-grid">
                  {evaluations.map((evaluation) => {
                    const avgScore = calculateAverageScore(evaluation.scores);
                    return (
                      <div
                        key={evaluation.evaluationId}
                        className="report-card evaluation"
                      >
                        <div className="card-header">
                          <div className="header-info">
                            <div className="badges">
                              <span className="cycle-badge">
                                {evaluation.cycle === "weekly"
                                  ? "Hàng tuần"
                                  : "Hàng tháng"}
                              </span>
                              <span className="period-badge">
                                Kỳ {evaluation.periodNo}
                              </span>
                            </div>
                            <span
                              className={`avg-score ${getScoreClass(avgScore)}`}
                            >
                              <Star size={16} />
                              Trung bình: {avgScore}
                            </span>
                          </div>
                          <p className="card-date">
                            <Calendar size={14} />
                            {new Date(evaluation.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>

                        {evaluation.comment && (
                          <div className="card-comment">
                            <MessageSquare size={16} />
                            <p>{evaluation.comment}</p>
                          </div>
                        )}

                        <div className="scores-grid">
                          {evaluation.scores.map((score, idx) => (
                            <div key={idx} className="score-card">
                              <div className="score-info">
                                <span className="score-name">
                                  {score.criteriaName}
                                </span>
                                {score.comment && (
                                  <p className="score-comment">
                                    {score.comment}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`score-badge ${getScoreClass(
                                  score.score
                                )}`}
                              >
                                {score.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HR Final Reports Section */}
            <div className="final-reports-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FileText />
                  Báo Cáo Đánh Giá Cuối Kỳ Từ HR
                  <span className="count-badge">{reports.length}</span>
                </h2>
              </div>

              {reports.length === 0 ? (
                <div className="empty-state">
                  <FileText />
                  <p>Chưa có báo cáo cuối kỳ</p>
                  <small>
                    HR sẽ tạo báo cáo tổng kết cho bạn sau khi kết thúc
                  </small>
                </div>
              ) : (
                <div className="reports-grid">
                  {reports.map((report) => (
                    <div key={report.reportId} className="report-card final">
                      <div className="card-header">
                        <div className="header-info">
                          <span
                            className={`overall-score ${getScoreClass(
                              report.overallScore
                            )}`}
                          >
                            <TrendingUp size={20} />
                            <span className="score-label">Điểm tổng quát</span>
                            <span className="score-value">
                              {report.overallScore}
                            </span>
                          </span>
                        </div>
                        <div className="card-meta">
                          <p className="hr-info">
                            <User size={14} />
                            {report.hrName}
                          </p>
                          <p className="card-date">
                            <Calendar size={14} />
                            {new Date(report.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="report-body">
                        <div className="report-section">
                          <h4 className="section-label">
                            <MessageSquare size={16} />
                            Tóm tắt đánh giá
                          </h4>
                          <p className="section-content">{report.summary}</p>
                        </div>

                        <div className="report-section">
                          <h4 className="section-label">
                            <Award size={16} />
                            Đề xuất
                          </h4>
                          <p className="section-content recommendations">
                            {report.recommendations}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Statistics */}
            {(evaluations.length > 0 || reports.length > 0) && (
              <div className="statistics-card">
                <h3 className="stats-title">
                  <TrendingUp />
                  Thống kê tổng quan
                </h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <ClipboardList className="stat-icon" />
                    <div className="stat-content">
                      <span className="stat-value">{evaluations.length}</span>
                      <span className="stat-label">Đánh giá định kỳ</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FileText className="stat-icon" />
                    <div className="stat-content">
                      <span className="stat-value">{reports.length}</span>
                      <span className="stat-label">Báo cáo cuối kỳ</span>
                    </div>
                  </div>
                  {reports.length > 0 && (
                    <div className="stat-item">
                      <Star className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">
                          {(
                            reports.reduce(
                              (sum, r) => sum + r.overallScore,
                              0
                            ) / reports.length
                          ).toFixed(1)}
                        </span>
                        <span className="stat-label">Điểm trung bình</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
