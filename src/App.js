import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import ExamHeader from "./components/ExamHeader";
import SetupScreen from "./components/SetupScreen";
import ExamScreen from "./components/ExamScreen";
import ResultsScreen from "./components/ResultsScreen";
import ReviewScreen from "./components/ReviewScreen";
import { GeminiService } from "./services/GeminiService";

const EXAM_DURATION = 130 * 60; // 130 minutes in seconds
const EMBEDDED_API_KEY = "AIzaSyDPX7Dx1_JlZ-EJpbCM-i5aTAzWDY9h0Us";

function App() {
  const [currentScreen, setCurrentScreen] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION);
  const [examStartTime, setExamStartTime] = useState(null);
  const [examEndTime, setExamEndTime] = useState(null);
  const [results, setResults] = useState(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // Initialize Gemini service
  const geminiService = new GeminiService(EMBEDDED_API_KEY);

  const awsDomains = useMemo(
    () => [
      "Design Secure Applications and Architectures",
      "Design Resilient Architectures",
      "Design High-Performing Architectures",
      "Design Cost-Optimized Architectures",
    ],
    []
  );

  const calculateResults = useCallback(() => {
    let correctAnswers = 0;
    const domainStats = {};

    awsDomains.forEach((domain) => {
      domainStats[domain] = { correct: 0, total: 0 };
    });

    questions.forEach((question, index) => {
      if (!question) return; // Skip if question wasn't generated

      const userAnswer = answers[index];
      const correctAnswer = question.correct;
      let isCorrect = false;

      if (question.type === "multiple response") {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const sortedUser = [...userAnswer].sort();
          const sortedCorrect = [...correctAnswer].sort();
          isCorrect =
            sortedUser.length === sortedCorrect.length &&
            sortedUser.every((val, idx) => val === sortedCorrect[idx]);
        }
      } else {
        isCorrect = userAnswer === correctAnswer[0];
      }

      if (isCorrect) {
        correctAnswers++;
      }

      domainStats[question.domain].total++;
      if (isCorrect) {
        domainStats[question.domain].correct++;
      }
    });

    // Calculate time taken properly
    let timeTakenMs = 0;
    if (examStartTime && examEndTime) {
      timeTakenMs = examEndTime.getTime() - examStartTime.getTime();
    } else if (examStartTime) {
      // If exam is still running, calculate current time
      timeTakenMs = new Date().getTime() - examStartTime.getTime();
    }

    // Ensure positive time and convert to minutes/seconds
    timeTakenMs = Math.max(0, timeTakenMs);
    const timeTakenMinutes = Math.floor(timeTakenMs / (1000 * 60));
    const timeTakenSeconds = Math.floor((timeTakenMs % (1000 * 60)) / 1000);

    const totalQuestions = questions.filter((q) => q).length;
    const calculatedResults = {
      correct: correctAnswers,
      total: totalQuestions,
      percentage:
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0,
      score:
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 1000)
          : 0,
      passed:
        totalQuestions > 0 ? correctAnswers / totalQuestions >= 0.72 : false,
      timeTaken: {
        minutes: timeTakenMinutes,
        seconds: timeTakenSeconds,
        totalMs: timeTakenMs,
      },
      domainStats: domainStats,
    };

    setResults(calculatedResults);
  }, [questions, answers, examEndTime, examStartTime, awsDomains]);

  const finishExam = useCallback(() => {
    setExamEndTime(new Date());
    calculateResults();
    setCurrentScreen("results");
  }, [calculateResults]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (currentScreen === "exam" && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            finishExam();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentScreen, timeRemaining, finishExam]);

  const startExam = async () => {
    setCurrentScreen("exam");
    setExamStartTime(new Date());
    setTimeRemaining(EXAM_DURATION);
    setCurrentQuestion(0);
    setAnswers({});
    setFlagged(new Set());
    setQuestions([]);

    // Generate the first question
    await generateNextQuestion(1);
  };

  const generateNextQuestion = async (questionNumber) => {
    setIsGeneratingQuestion(true);

    try {
      const domain = awsDomains[Math.floor(Math.random() * awsDomains.length)];
      const isMultipleResponse = Math.random() < 0.5;

      let newQuestion;
      try {
        newQuestion = await geminiService.generateQuestion(
          domain,
          isMultipleResponse,
          questionNumber
        );
      } catch (apiError) {
        // Use fallback question when API fails
        newQuestion = createFallbackQuestion(
          questionNumber,
          domain,
          isMultipleResponse
        );
      }

      setQuestions((prev) => {
        const updated = [...prev];
        updated[questionNumber - 1] = newQuestion;
        return updated;
      });
    } catch (error) {
      // Always provide a fallback question
      const domain = awsDomains[Math.floor(Math.random() * awsDomains.length)];
      const isMultipleResponse = Math.random() < 0.5;
      const fallbackQuestion = createFallbackQuestion(
        questionNumber,
        domain,
        isMultipleResponse
      );

      setQuestions((prev) => {
        const updated = [...prev];
        updated[questionNumber - 1] = fallbackQuestion;
        return updated;
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const createFallbackQuestion = (
    questionNumber,
    domain,
    isMultipleResponse
  ) => {
    const fallbackQuestions = {
      "Design Secure Applications and Architectures": [
        {
          question:
            "Which AWS services provide network-level security for your VPC? (Select all that apply)",
          options: [
            "Security Groups",
            "Network ACLs",
            "AWS WAF",
            "AWS Shield",
            "VPC Flow Logs",
          ],
          correct: isMultipleResponse ? [0, 1] : [1],
          explanation:
            "Network ACLs provide subnet-level security, while Security Groups provide instance-level security. Both are essential for VPC network security.",
        },
        {
          question:
            "What is the best practice for storing sensitive configuration data in AWS?",
          options: [
            "Environment variables",
            "AWS Systems Manager Parameter Store",
            "Hard-coded in application",
            "S3 bucket",
          ],
          correct: [1],
          explanation:
            "AWS Systems Manager Parameter Store provides secure, hierarchical storage for configuration data and secrets.",
        },
      ],
      "Design Resilient Architectures": [
        {
          question:
            "Which strategies ensure high availability for applications on AWS? (Select all that apply)",
          options: [
            "Multi-AZ deployment",
            "Auto Scaling",
            "Single region deployment",
            "Load balancing",
            "Manual scaling",
          ],
          correct: isMultipleResponse ? [0, 1, 3] : [0],
          explanation:
            "Multi-AZ deployment, Auto Scaling, and Load Balancing all contribute to high availability by distributing load and providing redundancy.",
        },
        {
          question:
            "What is the primary benefit of using multiple Availability Zones?",
          options: [
            "Cost reduction",
            "Fault tolerance",
            "Better performance",
            "Easier management",
          ],
          correct: [1],
          explanation:
            "Multiple Availability Zones provide fault tolerance by ensuring your application can survive the failure of an entire AZ.",
        },
      ],
      "Design High-Performing Architectures": [
        {
          question:
            "Which AWS services can improve application performance through caching? (Select all that apply)",
          options: [
            "Amazon ElastiCache",
            "Amazon CloudFront",
            "Amazon RDS",
            "Amazon S3",
            "AWS Lambda",
          ],
          correct: isMultipleResponse ? [0, 1] : [0],
          explanation:
            "Amazon ElastiCache provides in-memory caching, while CloudFront provides edge caching for content delivery.",
        },
        {
          question:
            "What is the best storage class for frequently accessed data in S3?",
          options: [
            "S3 Glacier",
            "S3 Standard",
            "S3 Infrequent Access",
            "S3 Deep Archive",
          ],
          correct: [1],
          explanation:
            "S3 Standard is optimized for frequently accessed data with low latency and high throughput.",
        },
      ],
      "Design Cost-Optimized Architectures": [
        {
          question:
            "Which AWS pricing models offer cost savings for predictable workloads? (Select all that apply)",
          options: [
            "On-Demand",
            "Reserved Instances",
            "Spot Instances",
            "Dedicated Hosts",
            "Savings Plans",
          ],
          correct: isMultipleResponse ? [1, 4] : [1],
          explanation:
            "Reserved Instances and Savings Plans offer significant cost savings for predictable, steady-state workloads.",
        },
        {
          question:
            "What is the most cost-effective storage option for long-term archival?",
          options: ["S3 Standard", "S3 Glacier", "S3 Deep Archive", "EBS"],
          correct: [2],
          explanation:
            "S3 Deep Archive is the lowest-cost storage class, designed for long-term retention and digital preservation.",
        },
      ],
    };

    const domainQuestions =
      fallbackQuestions[domain] ||
      fallbackQuestions["Design Secure Applications and Architectures"];
    const selectedQuestion =
      domainQuestions[Math.floor(Math.random() * domainQuestions.length)];

    return {
      id: questionNumber,
      question: selectedQuestion.question,
      options: selectedQuestion.options,
      correct:
        isMultipleResponse && selectedQuestion.correct.length > 1
          ? selectedQuestion.correct
          : [selectedQuestion.correct[0]],
      explanation: selectedQuestion.explanation,
      domain: domain,
      type: isMultipleResponse ? "multiple response" : "multiple choice",
    };
  };

  const updateAnswer = (questionIndex, optionIndex, isChecked) => {
    const question = questions[questionIndex];
    if (!question) return;

    setAnswers((prev) => {
      const newAnswers = { ...prev };

      if (question.type === "multiple response") {
        if (!newAnswers[questionIndex]) {
          newAnswers[questionIndex] = [];
        }

        if (isChecked) {
          if (!newAnswers[questionIndex].includes(optionIndex)) {
            newAnswers[questionIndex] = [
              ...newAnswers[questionIndex],
              optionIndex,
            ];
          }
        } else {
          newAnswers[questionIndex] = newAnswers[questionIndex].filter(
            (idx) => idx !== optionIndex
          );
        }
      } else {
        if (isChecked) {
          newAnswers[questionIndex] = optionIndex;
        }
      }

      return newAnswers;
    });
  };

  const toggleFlag = (questionIndex) => {
    setFlagged((prev) => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionIndex)) {
        newFlagged.delete(questionIndex);
      } else {
        newFlagged.add(questionIndex);
      }
      return newFlagged;
    });
  };

  const navigateToQuestion = async (questionIndex) => {
    if (questionIndex >= 0 && questionIndex < 65) {
      setCurrentQuestion(questionIndex);

      // Generate question if it doesn't exist
      if (!questions[questionIndex]) {
        await generateNextQuestion(questionIndex + 1);
      }
    }
  };

  const navigateNext = async () => {
    const nextIndex = currentQuestion + 1;
    if (nextIndex < 65) {
      setCurrentQuestion(nextIndex);

      // Generate next question if it doesn't exist
      if (!questions[nextIndex]) {
        await generateNextQuestion(nextIndex + 1);
      }
    } else {
      finishExam();
    }
  };

  const navigatePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetExam = () => {
    setCurrentScreen("setup");
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setFlagged(new Set());
    setTimeRemaining(EXAM_DURATION);
    setExamStartTime(null);
    setExamEndTime(null);
    setResults(null);
    setIsGeneratingQuestion(false);
  };

  const showReview = () => {
    setCurrentScreen("review");
  };

  const showResults = () => {
    setCurrentScreen("results");
  };

  return (
    <div className="container">
      <ExamHeader
        timeRemaining={timeRemaining}
        currentQuestion={currentQuestion}
        totalQuestions={65}
        showTimer={currentScreen === "exam"}
      />

      {currentScreen === "setup" && <SetupScreen onStartExam={startExam} />}

      {currentScreen === "exam" && (
        <ExamScreen
          questions={questions}
          currentQuestion={currentQuestion}
          answers={answers}
          flagged={flagged}
          isGeneratingQuestion={isGeneratingQuestion}
          onAnswerChange={updateAnswer}
          onToggleFlag={toggleFlag}
          onNavigateToQuestion={navigateToQuestion}
          onNavigateNext={navigateNext}
          onNavigatePrevious={navigatePrevious}
          onFinishExam={finishExam}
        />
      )}

      {currentScreen === "results" && (
        <ResultsScreen
          results={results}
          onShowReview={showReview}
          onRetakeExam={resetExam}
        />
      )}

      {currentScreen === "review" && (
        <ReviewScreen
          questions={questions.filter((q) => q)} // Only show generated questions
          answers={answers}
          onBackToResults={showResults}
        />
      )}
    </div>
  );
}

export default App;
