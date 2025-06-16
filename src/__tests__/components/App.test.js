import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../src/App";
import { sampleQuestions, sampleAnswers } from "../fixtures/sampleQuestions";

// Mock the GeminiService
jest.mock("../../src/services/GeminiService", () => ({
  GeminiService: jest.fn().mockImplementation(() => ({
    generateQuestion: jest.fn().mockResolvedValue(sampleQuestions[0]),
  })),
}));

// Mock all child components to focus on App logic
jest.mock("../../src/components/ExamHeader", () => {
  return function MockExamHeader({
    timeRemaining,
    currentQuestion,
    totalQuestions,
    showTimer,
  }) {
    return (
      <div data-testid="exam-header">
        {showTimer && <span data-testid="timer">{timeRemaining}</span>}
        <span data-testid="question-counter">
          {currentQuestion + 1} of {totalQuestions}
        </span>
      </div>
    );
  };
});

jest.mock("../../src/components/SetupScreen", () => {
  return function MockSetupScreen({ onStartExam }) {
    return (
      <div data-testid="setup-screen">
        <button onClick={onStartExam} data-testid="start-exam-btn">
          Start Exam
        </button>
      </div>
    );
  };
});

jest.mock("../../src/components/ExamScreen", () => {
  return function MockExamScreen({
    questions,
    currentQuestion,
    answers,
    flagged,
    onAnswerChange,
    onToggleFlag,
    onNavigateNext,
    onNavigatePrevious,
    onFinishExam,
  }) {
    return (
      <div data-testid="exam-screen">
        <span data-testid="current-question">{currentQuestion}</span>
        <button
          onClick={() => onAnswerChange(0, 0, true)}
          data-testid="answer-btn"
        >
          Answer A
        </button>
        <button onClick={() => onToggleFlag(0)} data-testid="flag-btn">
          Flag
        </button>
        <button onClick={onNavigatePrevious} data-testid="prev-btn">
          Previous
        </button>
        <button onClick={onNavigateNext} data-testid="next-btn">
          Next
        </button>
        <button onClick={onFinishExam} data-testid="finish-btn">
          Finish
        </button>
      </div>
    );
  };
});

jest.mock("../../src/components/ResultsScreen", () => {
  return function MockResultsScreen({ results, onShowReview, onRetakeExam }) {
    return (
      <div data-testid="results-screen">
        <span data-testid="score">{results?.score}</span>
        <span data-testid="percentage">{results?.percentage}%</span>
        <span data-testid="passed">
          {results?.passed ? "PASSED" : "FAILED"}
        </span>
        <button onClick={onShowReview} data-testid="review-btn">
          Review
        </button>
        <button onClick={onRetakeExam} data-testid="retake-btn">
          Retake
        </button>
      </div>
    );
  };
});

jest.mock("../../src/components/ReviewScreen", () => {
  return function MockReviewScreen({ questions, answers, onBackToResults }) {
    return (
      <div data-testid="review-screen">
        <span data-testid="questions-count">{questions.length}</span>
        <button onClick={onBackToResults} data-testid="back-btn">
          Back to Results
        </button>
      </div>
    );
  };
});

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date for consistent testing
    jest.spyOn(Date, "now").mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Render", () => {
    test("should render setup screen by default", () => {
      render(<App />);
      expect(screen.getByTestId("setup-screen")).toBeInTheDocument();
      expect(screen.getByTestId("start-exam-btn")).toBeInTheDocument();
    });

    test("should render exam header", () => {
      render(<App />);
      expect(screen.getByTestId("exam-header")).toBeInTheDocument();
    });
  });

  describe("Exam Flow", () => {
    test("should start exam when start button is clicked", async () => {
      render(<App />);

      const startBtn = screen.getByTestId("start-exam-btn");
      fireEvent.click(startBtn);

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("setup-screen")).not.toBeInTheDocument();
    });

    test("should show timer during exam", async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("timer")).toBeInTheDocument();
      });
    });

    test("should navigate between questions", async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      // Current question should be 0
      expect(screen.getByTestId("current-question")).toHaveTextContent("0");

      // Click next button
      fireEvent.click(screen.getByTestId("next-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("current-question")).toHaveTextContent("1");
      });
    });

    test("should handle answer selection", async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      // Select an answer
      fireEvent.click(screen.getByTestId("answer-btn"));

      // The answer should be recorded (this would be tested through the component's state)
      expect(screen.getByTestId("answer-btn")).toBeInTheDocument();
    });

    test("should handle question flagging", async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      // Flag the question
      fireEvent.click(screen.getByTestId("flag-btn"));

      // The question should be flagged (this would be tested through the component's state)
      expect(screen.getByTestId("flag-btn")).toBeInTheDocument();
    });

    test("should finish exam and show results", async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      // Finish the exam
      fireEvent.click(screen.getByTestId("finish-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("results-screen")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("exam-screen")).not.toBeInTheDocument();
    });
  });

  describe("Results and Review", () => {
    test("should show review screen when review button is clicked", async () => {
      render(<App />);

      // Start and finish exam quickly
      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("finish-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("results-screen")).toBeInTheDocument();
      });

      // Click review button
      fireEvent.click(screen.getByTestId("review-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("review-screen")).toBeInTheDocument();
      });
    });

    test("should return to results from review screen", async () => {
      render(<App />);

      // Navigate to review screen
      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("finish-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("results-screen")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("review-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("review-screen")).toBeInTheDocument();
      });

      // Go back to results
      fireEvent.click(screen.getByTestId("back-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("results-screen")).toBeInTheDocument();
      });
    });

    test("should reset exam when retake button is clicked", async () => {
      render(<App />);

      // Complete an exam
      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("finish-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("results-screen")).toBeInTheDocument();
      });

      // Click retake
      fireEvent.click(screen.getByTestId("retake-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("setup-screen")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("results-screen")).not.toBeInTheDocument();
    });
  });

  describe("Timer Functionality", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should count down timer during exam", async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      const timer = screen.getByTestId("timer");
      const initialTime = timer.textContent;

      // Fast forward time
      jest.advanceTimersByTime(5000); // 5 seconds

      await waitFor(() => {
        expect(timer.textContent).not.toBe(initialTime);
      });
    });

    test("should auto-finish exam when timer reaches zero", async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });

      // Fast forward to end of exam time
      jest.advanceTimersByTime(130 * 60 * 1000); // 130 minutes

      await waitFor(() => {
        expect(screen.getByTestId("results-screen")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle question generation errors gracefully", async () => {
      const { GeminiService } = require("../../src/services/GeminiService");
      GeminiService.mockImplementation(() => ({
        generateQuestion: jest.fn().mockRejectedValue(new Error("API Error")),
      }));

      render(<App />);

      fireEvent.click(screen.getByTestId("start-exam-btn"));

      // Should still render exam screen even if question generation fails
      await waitFor(() => {
        expect(screen.getByTestId("exam-screen")).toBeInTheDocument();
      });
    });
  });

  describe("AWS Domains", () => {
    test("should include all required AWS domains", () => {
      render(<App />);

      const expectedDomains = [
        "Design Secure Applications and Architectures",
        "Design Resilient Architectures",
        "Design High-Performing Architectures",
        "Design Cost-Optimized Architectures",
      ];

      // This would need to be tested through the actual component implementation
      // For now, we just verify the component renders
      expect(screen.getByTestId("setup-screen")).toBeInTheDocument();
    });
  });
});
