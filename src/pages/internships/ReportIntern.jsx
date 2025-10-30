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
      <style>{`
        .intern-reports-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .header-text h1 {
          margin: 0;
          font-size: 2rem;
          color: #1a202c;
          font-weight: 700;
        }

        .header-text p {
          margin: 0.5rem 0 0 0;
          color: #718096;
          font-size: 1rem;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-refresh:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: #fee;
          color: #c53030;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          border: 1px solid #fc8181;
        }

        .loading-container {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .loading-text {
          color: #718096;
          font-size: 1.1rem;
        }

        .evaluations-section,
        .final-reports-section {
          margin-bottom: 2rem;
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .count-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .empty-state svg {
          width: 60px;
          height: 60px;
          color: #cbd5e0;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: #4a5568;
          font-size: 1.2rem;
          margin: 0.5rem 0;
          font-weight: 600;
        }

        .empty-state small {
          color: #718096;
          font-size: 0.95rem;
        }

        .reports-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }

        .report-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }

        .report-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .report-card.evaluation {
          border-left-color: #667eea;
        }

        .report-card.final {
          border-left-color: #48bb78;
        }

        .card-header {
          margin-bottom: 1.5rem;
        }

        .header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .cycle-badge,
        .period-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .cycle-badge {
          background: #e6fffa;
          color: #047857;
        }

        .period-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .avg-score,
        .overall-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .avg-score.excellent,
        .overall-score.excellent {
          background: #d1fae5;
          color: #047857;
        }

        .avg-score.good,
        .overall-score.good {
          background: #dbeafe;
          color: #1e40af;
        }

        .avg-score.average,
        .overall-score.average {
          background: #fef3c7;
          color: #92400e;
        }

        .avg-score.poor,
        .overall-score.poor {
          background: #fee2e2;
          color: #991b1b;
        }

        .card-date,
        .hr-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #718096;
          font-size: 0.9rem;
          margin: 0;
        }

        .card-meta {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .card-comment {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .card-comment svg {
          flex-shrink: 0;
          color: #667eea;
          margin-top: 0.2rem;
        }

        .card-comment p {
          margin: 0;
          color: #4a5568;
          line-height: 1.6;
        }

        .scores-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .score-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .score-card:hover {
          background: #edf2f7;
        }

        .score-info {
          flex: 1;
        }

        .score-name {
          font-weight: 600;
          color: #2d3748;
          display: block;
          margin-bottom: 0.25rem;
        }

        .score-comment {
          font-size: 0.85rem;
          color: #718096;
          margin: 0.25rem 0 0 0;
        }

        .score-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.1rem;
          min-width: 50px;
          text-align: center;
        }

        .score-badge.excellent {
          background: #d1fae5;
          color: #047857;
        }

        .score-badge.good {
          background: #dbeafe;
          color: #1e40af;
        }

        .score-badge.average {
          background: #fef3c7;
          color: #92400e;
        }

        .score-badge.poor {
          background: #fee2e2;
          color: #991b1b;
        }

        .overall-score {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        .score-label {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .score-value {
          font-size: 1.5rem;
          margin-left: 0.5rem;
        }

        .report-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .report-section {
          background: #f7fafc;
          padding: 1.25rem;
          border-radius: 10px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #2d3748;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
        }

        .section-content {
          color: #4a5568;
          line-height: 1.7;
          margin: 0;
        }

        .section-content.recommendations {
          font-weight: 500;
          color: #047857;
        }

        .statistics-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .stats-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #1a202c;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          color: #667eea;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #718096;
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .intern-reports-page {
            padding: 1rem;
          }

          .header-card {
            padding: 1.5rem;
          }

          .header-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-text h1 {
            font-size: 1.5rem;
          }

          .reports-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

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
                  Báo Cáo Cuối Kỳ Từ HR
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
