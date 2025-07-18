import React from "react";
import "./ExamHeader.css";

const ExamHeader = ({
  timeRemaining,
  currentQuestion,
  totalQuestions,
  showTimer,
}) => {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    if (timeRemaining <= 300) return "timer danger"; // 5 minutes
    if (timeRemaining <= 900) return "timer warning"; // 15 minutes
    return "timer";
  };

  const progressPercentage =
    totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  return (
    <header className="exam-header">
      <div className="exam-info">
        <h1>🚀 AWS Solutions Architect Associate</h1>
        <div className="exam-stats">
          <span className="exam-type">Practice Exam</span>
          <span className="question-count">65 Questions</span>
        </div>
      </div>

      {showTimer && (
        <div className="timer-section">
          <div className={getTimerClass()}>{formatTime(timeRemaining)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="question-progress">
            Question {currentQuestion + 1} of {totalQuestions}
          </div>
        </div>
      )}
    </header>
  );
};

export default ExamHeader;
