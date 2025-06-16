import React from "react";
import "./SetupScreen.css";

const SetupScreen = ({ onStartExam }) => {
  return (
    <div className="setup-screen">
      <div className="setup-container">
        <div className="setup-header">
          <h2>🚀 AWS Practice Exam</h2>
          <p>Ready to test your AWS Solutions Architect Associate knowledge?</p>
        </div>

        <div className="exam-instructions">
          <h3>📋 Exam Instructions</h3>
          <ul>
            <li>
              <strong>Duration:</strong> 130 minutes (2 hours 10 minutes)
            </li>
            <li>
              <strong>Questions:</strong> 65 questions total
            </li>
            <li>
              <strong>Format:</strong> Multiple choice and multiple response
            </li>
            <li>
              <strong>Passing Score:</strong> 720/1000 (approximately 72%)
            </li>
            <li>
              <strong>AI-Generated:</strong> Questions created dynamically as
              you progress
            </li>
          </ul>

          <div className="exam-domains">
            <h4>📚 Covered Domains:</h4>
            <div className="domain-list">
              <div className="domain-item">
                <span className="domain-icon">🔒</span>
                <span>Design Secure Applications and Architectures</span>
              </div>
              <div className="domain-item">
                <span className="domain-icon">🏗️</span>
                <span>Design Resilient Architectures</span>
              </div>
              <div className="domain-item">
                <span className="domain-icon">⚡</span>
                <span>Design High-Performing Architectures</span>
              </div>
              <div className="domain-item">
                <span className="domain-icon">💰</span>
                <span>Design Cost-Optimized Architectures</span>
              </div>
            </div>
          </div>

          <div className="exam-features">
            <h4>✨ Smart Features:</h4>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <span>Questions generated one-by-one using AI</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎲</span>
                <span>
                  Random mix of single and multiple response questions
                </span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚩</span>
                <span>Flag questions for review</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Detailed performance analysis</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={onStartExam} className="btn btn-success start-btn">
          Start Exam
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
