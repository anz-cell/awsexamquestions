import React from "react";
import QuestionDisplay from "./QuestionDisplay";
import QuestionNavigator from "./QuestionNavigator";
import "./ExamScreen.css";

const ExamScreen = ({
  questions,
  currentQuestion,
  answers,
  flagged,
  isGeneratingQuestion,
  onAnswerChange,
  onToggleFlag,
  onNavigateToQuestion,
  onNavigateNext,
  onNavigatePrevious,
  onFinishExam,
}) => {
  const currentQ = questions[currentQuestion];

  if (!currentQ && isGeneratingQuestion) {
    return (
      <div className="exam-screen">
        <div className="loading-question">
          <div className="spinner"></div>
          <p>Generating question {currentQuestion + 1}...</p>
          <small>Please wait while AI creates your next question</small>
        </div>
      </div>
    );
  }

  if (!currentQ && !isGeneratingQuestion) {
    return (
      <div className="exam-screen">
        <div className="loading-question">
          <div className="spinner"></div>
          <p>Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-screen">
      <div className="exam-layout">
        <div className="exam-content">
          <QuestionDisplay
            question={currentQ}
            questionNumber={currentQuestion + 1}
            totalQuestions={65}
            userAnswer={answers[currentQuestion]}
            isFlagged={flagged.has(currentQuestion)}
            isGeneratingQuestion={isGeneratingQuestion}
            onAnswerChange={(optionIndex, isChecked) =>
              onAnswerChange(currentQuestion, optionIndex, isChecked)
            }
            onToggleFlag={() => onToggleFlag(currentQuestion)}
            onNavigatePrevious={onNavigatePrevious}
            onNavigateNext={onNavigateNext}
            canNavigatePrevious={currentQuestion > 0}
            canNavigateNext={currentQuestion < 64}
            isLastQuestion={currentQuestion === 64}
          />
        </div>

        <div className="exam-sidebar">
          <QuestionNavigator
            totalQuestions={65}
            currentQuestion={currentQuestion}
            answers={answers}
            flagged={flagged}
            generatedQuestions={questions.length}
            onNavigateToQuestion={onNavigateToQuestion}
            onFinishExam={onFinishExam}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamScreen;
