// Utility functions for testing exam-related functionality
import {
  sampleResults,
  sampleQuestions,
  sampleAnswers,
  awsDomainsTestData,
} from "../fixtures/sampleQuestions";

// Utility functions that would be used in the actual application
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const calculateScore = (correct, total) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000);
};

export const calculatePercentage = (correct, total) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

export const isPassing = (correct, total, passingThreshold = 0.72) => {
  if (total === 0) return false;
  return correct / total >= passingThreshold;
};

export const validateAnswer = (userAnswer, correctAnswer, questionType) => {
  if (questionType === "multiple response") {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return (
      sortedUser.length === sortedCorrect.length &&
      sortedUser.every((val, idx) => val === sortedCorrect[idx])
    );
  } else {
    return userAnswer === correctAnswer[0];
  }
};

export const calculateDomainStats = (questions, answers) => {
  const domainStats = {};

  // Initialize domain stats
  awsDomainsTestData.forEach((domain) => {
    domainStats[domain] = { correct: 0, total: 0 };
  });

  questions.forEach((question, index) => {
    if (!question) return;

    const userAnswer = answers[index];
    const isCorrect = validateAnswer(
      userAnswer,
      question.correct,
      question.type
    );

    domainStats[question.domain].total++;
    if (isCorrect) {
      domainStats[question.domain].correct++;
    }
  });

  return domainStats;
};

export const getTimeRemaining = (startTime, duration) => {
  const now = new Date();
  const elapsed = Math.floor((now - startTime) / 1000);
  const remaining = Math.max(0, duration - elapsed);
  return remaining;
};

describe("Exam Utility Functions", () => {
  describe("formatTime", () => {
    test("should format seconds correctly", () => {
      expect(formatTime(65)).toBe("1:05");
      expect(formatTime(3665)).toBe("1:01:05");
      expect(formatTime(45)).toBe("0:45");
      expect(formatTime(0)).toBe("0:00");
    });

    test("should handle edge cases", () => {
      expect(formatTime(3600)).toBe("1:00:00");
      expect(formatTime(7200)).toBe("2:00:00");
      expect(formatTime(86400)).toBe("24:00:00");
    });

    test("should pad single digits", () => {
      expect(formatTime(9)).toBe("0:09");
      expect(formatTime(69)).toBe("1:09");
      expect(formatTime(3609)).toBe("1:00:09");
    });
  });

  describe("calculateScore", () => {
    test("should calculate score correctly", () => {
      expect(calculateScore(36, 50)).toBe(720);
      expect(calculateScore(50, 50)).toBe(1000);
      expect(calculateScore(25, 50)).toBe(500);
      expect(calculateScore(0, 50)).toBe(0);
    });

    test("should handle edge cases", () => {
      expect(calculateScore(0, 0)).toBe(0);
      expect(calculateScore(1, 1)).toBe(1000);
      expect(calculateScore(33, 65)).toBe(508);
    });
  });

  describe("calculatePercentage", () => {
    test("should calculate percentage correctly", () => {
      expect(calculatePercentage(75, 100)).toBe(75);
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(100, 100)).toBe(100);
      expect(calculatePercentage(0, 100)).toBe(0);
    });

    test("should handle rounding", () => {
      expect(calculatePercentage(33, 100)).toBe(33);
      expect(calculatePercentage(66, 100)).toBe(66);
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(2, 3)).toBe(67);
    });

    test("should handle edge cases", () => {
      expect(calculatePercentage(0, 0)).toBe(0);
      expect(calculatePercentage(1, 1)).toBe(100);
    });
  });

  describe("isPassing", () => {
    test("should determine passing correctly with default threshold", () => {
      expect(isPassing(36, 50)).toBe(true); // 72%
      expect(isPassing(35, 50)).toBe(false); // 70%
      expect(isPassing(50, 50)).toBe(true); // 100%
      expect(isPassing(0, 50)).toBe(false); // 0%
    });

    test("should work with custom threshold", () => {
      expect(isPassing(40, 50, 0.8)).toBe(true); // 80% with 80% threshold
      expect(isPassing(39, 50, 0.8)).toBe(false); // 78% with 80% threshold
    });

    test("should handle edge cases", () => {
      expect(isPassing(0, 0)).toBe(false);
      expect(isPassing(1, 1)).toBe(true);
    });
  });

  describe("validateAnswer", () => {
    test("should validate multiple choice answers", () => {
      expect(validateAnswer(0, [0], "multiple choice")).toBe(true);
      expect(validateAnswer(1, [0], "multiple choice")).toBe(false);
      expect(validateAnswer(2, [2], "multiple choice")).toBe(true);
    });

    test("should validate multiple response answers", () => {
      expect(validateAnswer([0, 1], [0, 1], "multiple response")).toBe(true);
      expect(validateAnswer([1, 0], [0, 1], "multiple response")).toBe(true);
      expect(validateAnswer([0], [0, 1], "multiple response")).toBe(false);
      expect(validateAnswer([0, 1, 2], [0, 1], "multiple response")).toBe(
        false
      );
    });

    test("should handle edge cases", () => {
      expect(validateAnswer(null, [0], "multiple choice")).toBe(false);
      expect(validateAnswer([], [], "multiple response")).toBe(true);
      expect(validateAnswer(undefined, [0], "multiple choice")).toBe(false);
    });
  });

  describe("calculateDomainStats", () => {
    test("should calculate domain statistics correctly", () => {
      const stats = calculateDomainStats(sampleQuestions, sampleAnswers);

      expect(stats["Design High-Performing Architectures"]).toEqual({
        correct: 1,
        total: 1,
      });

      expect(stats["Design Secure Applications and Architectures"]).toEqual({
        correct: 1,
        total: 1,
      });

      expect(stats["Design Cost-Optimized Architectures"]).toEqual({
        correct: 1,
        total: 1,
      });
    });

    test("should handle empty questions array", () => {
      const stats = calculateDomainStats([], {});

      awsDomainsTestData.forEach((domain) => {
        expect(stats[domain]).toEqual({ correct: 0, total: 0 });
      });
    });

    test("should handle questions without answers", () => {
      const stats = calculateDomainStats(sampleQuestions, {});

      expect(stats["Design High-Performing Architectures"]).toEqual({
        correct: 0,
        total: 1,
      });
    });
  });

  describe("getTimeRemaining", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-01T10:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should calculate remaining time correctly", () => {
      const startTime = new Date("2024-01-01T09:50:00Z"); // 10 minutes ago
      const duration = 1800; // 30 minutes

      const remaining = getTimeRemaining(startTime, duration);
      expect(remaining).toBe(1200); // 20 minutes left
    });

    test("should return 0 when time is up", () => {
      const startTime = new Date("2024-01-01T09:00:00Z"); // 1 hour ago
      const duration = 1800; // 30 minutes

      const remaining = getTimeRemaining(startTime, duration);
      expect(remaining).toBe(0);
    });

    test("should handle exact time match", () => {
      const startTime = new Date("2024-01-01T09:30:00Z"); // 30 minutes ago
      const duration = 1800; // 30 minutes

      const remaining = getTimeRemaining(startTime, duration);
      expect(remaining).toBe(0);
    });
  });

  describe("Integration Tests", () => {
    test("should process complete exam results", () => {
      const correctAnswers = sampleQuestions.filter((_, index) =>
        validateAnswer(
          sampleAnswers[index],
          sampleQuestions[index].correct,
          sampleQuestions[index].type
        )
      ).length;

      const total = sampleQuestions.length;
      const score = calculateScore(correctAnswers, total);
      const percentage = calculatePercentage(correctAnswers, total);
      const passed = isPassing(correctAnswers, total);

      expect(correctAnswers).toBe(3);
      expect(score).toBe(1000);
      expect(percentage).toBe(100);
      expect(passed).toBe(true);
    });

    test("should handle partially correct exam", () => {
      const partialAnswers = {
        0: 0, // Correct
        1: [0], // Incorrect (should be [0, 1])
        2: 2, // Correct
      };

      const correctAnswers = sampleQuestions.filter((_, index) =>
        validateAnswer(
          partialAnswers[index],
          sampleQuestions[index].correct,
          sampleQuestions[index].type
        )
      ).length;

      const total = sampleQuestions.length;
      const score = calculateScore(correctAnswers, total);
      const percentage = calculatePercentage(correctAnswers, total);
      const passed = isPassing(correctAnswers, total);

      expect(correctAnswers).toBe(2);
      expect(score).toBe(667);
      expect(percentage).toBe(67);
      expect(passed).toBe(false); // Below 72%
    });
  });
});
