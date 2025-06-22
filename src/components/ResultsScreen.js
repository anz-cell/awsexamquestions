import React from "react";
import "./ResultsScreen.css";
import ProgressGraph from "./ProgressGraph";

const ResultsScreen = ({
  results,
  history = [],
  onShowReview,
  onRetakeExam,
}) => {
  if (!results) {
    return (
      <div className="results-screen">
        <div className="loading">
          <div className="spinner"></div>
          <p>Calculating results...</p>
        </div>
      </div>
    );
  }

  const formatTime = (timeData) => {
    // Handle both old format (milliseconds) and new format (object)
    if (typeof timeData === "number") {
      const totalMinutes = Math.floor(timeData / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    } else if (timeData && typeof timeData === "object") {
      const hours = Math.floor(timeData.minutes / 60);
      const minutes = timeData.minutes % 60;
      const seconds = timeData.seconds;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m ${seconds}s`;
      }
    } else {
      return "0m 0s";
    }
  };

  return (
    <div className="results-screen">
      <div className="results-container">
        <div className="results-header">
          <h2>🎯 Exam Results</h2>
          <div className="score-display">
            <div className={`score-circle ${results.passed ? "pass" : "fail"}`}>
              <span className="score-number">{results.score}</span>
              <span className="score-total">/1000</span>
            </div>
            <div className="pass-status">
              <span
                className={`status-text ${results.passed ? "pass" : "fail"}`}
              >
                {results.passed ? "PASS" : "FAIL"}
              </span>
              <p className="status-description">
                {results.passed
                  ? "Congratulations! You passed the exam."
                  : "You need 720/1000 to pass. Keep studying!"}
              </p>
            </div>
          </div>
        </div>

        <div className="results-breakdown">
          <div className="stat-card">
            <span className="stat-label">Correct Answers</span>
            <span className="stat-value">
              {results.correct}/{results.total}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Percentage</span>
            <span className="stat-value">{results.percentage}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">{formatTime(results.timeTaken)}</span>
          </div>
        </div>

        <div className="domain-breakdown">
          <h3>📊 Domain Performance</h3>
          <div className="domain-scores">
            {Object.entries(results.domainStats).map(([domain, stats]) => {
              const percentage =
                stats.total > 0
                  ? Math.round((stats.correct / stats.total) * 100)
                  : 0;
              const passed = percentage >= 72;

              return (
                <div key={domain} className="domain-item">
                  <div className="domain-info">
                    <span className="domain-name">{domain}</span>
                    <span
                      className={`domain-score ${passed ? "pass" : "fail"}`}
                    >
                      {stats.correct}/{stats.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="domain-progress">
                    <div
                      className={`domain-progress-fill ${
                        passed ? "pass" : "fail"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {history.length > 1 && (
          <div className="progress-section">
            <h3>📈 Your Progress</h3>
            <ProgressGraph history={history} />
          </div>
        )}

        <div className="results-actions">
          <button onClick={onShowReview} className="btn btn-primary review-btn">
            📝 Review Answers
          </button>
          <button
            onClick={onRetakeExam}
            className="btn btn-secondary retake-btn"
          >
            🔄 Take New Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
