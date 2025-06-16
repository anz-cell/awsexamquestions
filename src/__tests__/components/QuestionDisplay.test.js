import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuestionDisplay from "../../src/components/QuestionDisplay";
import { sampleQuestions } from "../fixtures/sampleQuestions";

describe("QuestionDisplay Component", () => {
  const mockOnAnswerChange = jest.fn();
  const defaultProps = {
    question: sampleQuestions[0],
    answer: null,
    onAnswerChange: mockOnAnswerChange,
    questionNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Multiple Choice Questions", () => {
    test("should render multiple choice question correctly", () => {
      render(<QuestionDisplay {...defaultProps} />);

      expect(screen.getByText(sampleQuestions[0].question)).toBeInTheDocument();
      expect(
        screen.getByText("📚 Design High-Performing Architectures")
      ).toBeInTheDocument();

      // Check all options are rendered
      sampleQuestions[0].options.forEach((option) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    test("should render radio buttons for multiple choice", () => {
      render(<QuestionDisplay {...defaultProps} />);

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons).toHaveLength(4);
    });

    test("should handle answer selection for multiple choice", () => {
      render(<QuestionDisplay {...defaultProps} />);

      const firstOption = screen.getAllByRole("radio")[0];
      fireEvent.click(firstOption);

      expect(mockOnAnswerChange).toHaveBeenCalledWith(0, true);
    });

    test("should show selected answer for multiple choice", () => {
      render(<QuestionDisplay {...defaultProps} answer={1} />);

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons[1]).toBeChecked();
      expect(radioButtons[0]).not.toBeChecked();
    });
  });

  describe("Multiple Response Questions", () => {
    const multipleResponseQuestion = sampleQuestions[1]; // This is a multiple response question
    const multipleResponseProps = {
      ...defaultProps,
      question: multipleResponseQuestion,
    };

    test("should render multiple response question correctly", () => {
      render(<QuestionDisplay {...multipleResponseProps} />);

      expect(
        screen.getByText(multipleResponseQuestion.question)
      ).toBeInTheDocument();
      expect(screen.getByText("(Select all that apply)")).toBeInTheDocument();
    });

    test("should render checkboxes for multiple response", () => {
      render(<QuestionDisplay {...multipleResponseProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(5);
    });

    test("should handle multiple answer selections", () => {
      render(<QuestionDisplay {...multipleResponseProps} answer={[0]} />);

      const secondCheckbox = screen.getAllByRole("checkbox")[1];
      fireEvent.click(secondCheckbox);

      expect(mockOnAnswerChange).toHaveBeenCalledWith(1, true);
    });

    test("should show multiple selected answers", () => {
      render(<QuestionDisplay {...multipleResponseProps} answer={[0, 1]} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
    });

    test("should handle deselection of answers", () => {
      render(<QuestionDisplay {...multipleResponseProps} answer={[0, 1]} />);

      const firstCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(firstCheckbox);

      expect(mockOnAnswerChange).toHaveBeenCalledWith(0, false);
    });
  });

  describe("Question Information", () => {
    test("should display question number", () => {
      render(<QuestionDisplay {...defaultProps} questionNumber={5} />);

      expect(screen.getByText("Question 5")).toBeInTheDocument();
    });

    test("should display question domain", () => {
      render(<QuestionDisplay {...defaultProps} />);

      expect(
        screen.getByText("📚 Design High-Performing Architectures")
      ).toBeInTheDocument();
    });

    test("should display question type indicator for multiple response", () => {
      const multipleResponseProps = {
        ...defaultProps,
        question: sampleQuestions[1],
      };

      render(<QuestionDisplay {...multipleResponseProps} />);

      expect(screen.getByText("(Select all that apply)")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("should handle null question gracefully", () => {
      render(<QuestionDisplay {...defaultProps} question={null} />);

      expect(screen.getByTestId("question-display")).toBeInTheDocument();
    });

    test("should handle undefined answer gracefully", () => {
      render(<QuestionDisplay {...defaultProps} answer={undefined} />);

      const radioButtons = screen.getAllByRole("radio");
      radioButtons.forEach((radio) => {
        expect(radio).not.toBeChecked();
      });
    });

    test("should handle empty options array", () => {
      const questionWithNoOptions = {
        ...sampleQuestions[0],
        options: [],
      };

      render(
        <QuestionDisplay {...defaultProps} question={questionWithNoOptions} />
      );

      expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should have proper labels for radio buttons", () => {
      render(<QuestionDisplay {...defaultProps} />);

      sampleQuestions[0].options.forEach((option, index) => {
        const radio = screen.getAllByRole("radio")[index];
        expect(radio).toHaveAttribute(
          "aria-label",
          expect.stringContaining(option)
        );
      });
    });

    test("should have proper labels for checkboxes", () => {
      const multipleResponseProps = {
        ...defaultProps,
        question: sampleQuestions[1],
      };

      render(<QuestionDisplay {...multipleResponseProps} />);

      sampleQuestions[1].options.forEach((option, index) => {
        const checkbox = screen.getAllByRole("checkbox")[index];
        expect(checkbox).toHaveAttribute(
          "aria-label",
          expect.stringContaining(option)
        );
      });
    });

    test("should have proper heading structure", () => {
      render(<QuestionDisplay {...defaultProps} questionNumber={1} />);

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Question 1"
      );
    });
  });

  describe("Option Rendering", () => {
    test("should render options with correct text", () => {
      render(<QuestionDisplay {...defaultProps} />);

      expect(screen.getByText("Amazon EC2")).toBeInTheDocument();
      expect(screen.getByText("Amazon S3")).toBeInTheDocument();
      expect(screen.getByText("Amazon RDS")).toBeInTheDocument();
      expect(screen.getByText("Amazon VPC")).toBeInTheDocument();
    });

    test("should render options with proper indexing", () => {
      render(<QuestionDisplay {...defaultProps} />);

      const radioButtons = screen.getAllByRole("radio");
      radioButtons.forEach((radio, index) => {
        expect(radio).toHaveAttribute("value", index.toString());
      });
    });
  });
});
