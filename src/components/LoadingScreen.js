import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({ progress, total }) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="spinner-large"></div>
        <h2>Generating Your AWS Practice Exam</h2>
        <p className="loading-text">
          Creating 65 realistic questions using AI...
        </p>

        <div className="progress-container">
          <div className="progress-bar-large">
            <div
              className="progress-fill-large"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            <span className="progress-numbers">
              {progress} / {total}
            </span>
            <span className="progress-percentage">{percentage}%</span>
          </div>
        </div>

        <div className="loading-tips">
          <h4>💡 While you wait:</h4>
          <ul>
            <li>Questions are generated based on real AWS exam patterns</li>
            <li>Each question includes detailed explanations</li>
            <li>Mix of multiple choice and multiple response questions</li>
            <li>Coverage across all 4 AWS SA-A domains</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
