import React from "react";
import "./QuestionDisplay.css";

const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  isFlagged,
  isGeneratingQuestion,
  onAnswerChange,
  onToggleFlag,
  onNavigatePrevious,
  onNavigateNext,
  canNavigatePrevious,
  canNavigateNext,
  isLastQuestion,
}) => {
  const handleOptionChange = (optionIndex, isChecked) => {
    onAnswerChange(optionIndex, isChecked);
  };

  const isOptionSelected = (optionIndex) => {
    if (question.type === "multiple response") {
      return Array.isArray(userAnswer) && userAnswer.includes(optionIndex);
    } else {
      return userAnswer === optionIndex;
    }
  };

  return (
    <div className="question-display">
      <div className="question-header">
        <div className="question-info">
          <div className="question-number">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div
            className={`question-type ${
              question.type === "multiple response" ? "multiple" : "single"
            }`}
          >
            {question.type === "multiple response"
              ? "Multiple Response"
              : "Multiple Choice"}
          </div>
        </div>
        <div className="question-domain">📚 {question.domain}</div>
      </div>

      <div className="question-content">
        <h3 className="question-text">{question.question}</h3>

        {question.type === "multiple response" && (
          <div className="instruction-note">
            <strong>Note:</strong> Select all that apply. This question has
            multiple correct answers.
          </div>
        )}
      </div>

      <div className="options-container">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`option ${isOptionSelected(index) ? "selected" : ""}`}
            onClick={() => handleOptionChange(index, !isOptionSelected(index))}
          >
            <input
              type={
                question.type === "multiple response" ? "checkbox" : "radio"
              }
              name={`question-${questionNumber}`}
              value={index}
              checked={isOptionSelected(index)}
              onChange={(e) => handleOptionChange(index, e.target.checked)}
              className="option-input"
            />
            <label className="option-label">
              <span className="option-letter">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="option-text">{option}</span>
            </label>
          </div>
        ))}
      </div>

      <div className="question-actions">
        <div className="navigation-buttons">
          <button
            onClick={onNavigatePrevious}
            disabled={!canNavigatePrevious}
            className="btn btn-secondary"
          >
            ← Previous
          </button>

          <button
            onClick={onToggleFlag}
            className={`btn btn-warning flag-btn ${isFlagged ? "flagged" : ""}`}
          >
            {isFlagged ? "🚩 Unflag" : "🚩 Flag"}
          </button>

          <button
            onClick={onNavigateNext}
            disabled={isGeneratingQuestion}
            className="btn btn-primary"
          >
            {isGeneratingQuestion ? (
              <>
                <span className="spinner-small"></span>
                Generating...
              </>
            ) : (
              isLastQuestion ? "Finish Exam" : "Next →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;
