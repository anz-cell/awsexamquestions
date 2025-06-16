import React from "react";
import "./ReviewScreen.css";

const ReviewScreen = ({ questions, answers, onBackToResults }) => {
  const isCorrect = (questionIndex) => {
    const question = questions[questionIndex];
    const userAnswer = answers[questionIndex];
    const correctAnswer = question.correct;

    if (question.type === "multiple response") {
      if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
        const sortedUser = [...userAnswer].sort();
        const sortedCorrect = [...correctAnswer].sort();
        return (
          sortedUser.length === sortedCorrect.length &&
          sortedUser.every((val, idx) => val === sortedCorrect[idx])
        );
      }
      return false;
    } else {
      return userAnswer === correctAnswer[0];
    }
  };

  const isOptionSelected = (questionIndex, optionIndex) => {
    const answer = answers[questionIndex];
    if (Array.isArray(answer)) {
      return answer.includes(optionIndex);
    }
    return answer === optionIndex;
  };

  const isOptionCorrect = (question, optionIndex) => {
    return question.correct.includes(optionIndex);
  };

  return (
    <div className="review-screen">
      <div className="review-container">
        <div className="review-header">
          <h2>📝 Answer Review</h2>
          <button
            onClick={onBackToResults}
            className="btn btn-secondary back-btn"
          >
            ← Back to Results
          </button>
        </div>

        <div className="review-content">
          {questions.map((question, index) => (
            <div
              key={index}
              className={`review-question ${
                isCorrect(index) ? "correct" : "incorrect"
              }`}
            >
              <div className="review-question-header">
                <span className="review-question-number">
                  Question {index + 1}
                </span>
                <span
                  className={`review-status ${
                    isCorrect(index) ? "correct" : "incorrect"
                  }`}
                >
                  {isCorrect(index) ? "✅ Correct" : "❌ Incorrect"}
                </span>
              </div>

              <div className="review-question-info">
                <span className="review-domain">📚 {question.domain}</span>
                <span
                  className={`review-type ${
                    question.type === "multiple response"
                      ? "multiple"
                      : "single"
                  }`}
                >
                  {question.type === "multiple response"
                    ? "Multiple Response"
                    : "Multiple Choice"}
                </span>
              </div>

              <div className="review-question-text">{question.question}</div>

              <div className="review-options">
                {question.options.map((option, optionIndex) => {
                  const isSelected = isOptionSelected(index, optionIndex);
                  const isCorrectOption = isOptionCorrect(
                    question,
                    optionIndex
                  );

                  let optionClass = "review-option";

                  if (isCorrectOption) {
                    optionClass += " correct-answer";
                  }

                  if (isSelected) {
                    optionClass += " user-selected";
                    if (!isCorrectOption) {
                      optionClass += " wrong-selection";
                    }
                  }

                  return (
                    <div key={optionIndex} className={optionClass}>
                      <div className="option-indicator">
                        {isSelected && (
                          <span className="selection-mark">
                            {question.type === "multiple response"
                              ? "☑️"
                              : "🔘"}
                          </span>
                        )}
                        {isCorrectOption && (
                          <span className="correct-mark">✅</span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="wrong-mark">❌</span>
                        )}
                      </div>
                      <div className="option-content">
                        <span className="option-letter">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span className="option-text">{option}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="review-explanation">
                <h4>💡 Explanation:</h4>
                <p>{question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;
