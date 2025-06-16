import React from "react";
import "./QuestionNavigator.css";

const QuestionNavigator = ({
  totalQuestions,
  currentQuestion,
  answers,
  flagged,
  generatedQuestions,
  onNavigateToQuestion,
  onFinishExam,
}) => {
  const getQuestionStatus = (index) => {
    let status = "";

    if (index === currentQuestion) {
      status += " current";
    }

    if (index >= generatedQuestions) {
      status += " not-generated";
    }

    const answer = answers[index];
    if (answer !== undefined) {
      if (Array.isArray(answer) ? answer.length > 0 : answer !== undefined) {
        status += " answered";
      }
    }

    if (flagged.has(index)) {
      status += " flagged";
    }

    return status.trim();
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((key) => {
      const answer = answers[key];
      return Array.isArray(answer) ? answer.length > 0 : answer !== undefined;
    }).length;
  };

  const handleQuestionClick = (index) => {
    if (index <= currentQuestion || index < generatedQuestions) {
      onNavigateToQuestion(index);
    }
  };

  return (
    <div className="question-navigator">
      <h4>Question Navigator</h4>

      <div className="nav-stats">
        <div className="stat-item">
          <span className="stat-number">{getAnsweredCount()}</span>
          <span className="stat-label">Answered</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{flagged.size}</span>
          <span className="stat-label">Flagged</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{generatedQuestions}</span>
          <span className="stat-label">Generated</span>
        </div>
      </div>

      <div className="nav-grid">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <button
            key={index}
            className={`nav-item ${getQuestionStatus(index)}`}
            onClick={() => handleQuestionClick(index)}
            disabled={index > currentQuestion && index >= generatedQuestions}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="nav-legend">
        <div className="legend-item">
          <span className="legend-color answered"></span>
          <span>Answered</span>
        </div>
        <div className="legend-item">
          <span className="legend-color flagged"></span>
          <span>Flagged</span>
        </div>
        <div className="legend-item">
          <span className="legend-color current"></span>
          <span>Current</span>
        </div>
        <div className="legend-item">
          <span className="legend-color not-generated"></span>
          <span>Not Generated</span>
        </div>
      </div>

      <button onClick={onFinishExam} className="btn btn-danger finish-btn">
        Finish Exam
      </button>
    </div>
  );
};

export default QuestionNavigator;
