export class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  }

  async generateQuestion(domain, isMultipleResponse, questionNumber) {
    const questionType = isMultipleResponse
      ? "multiple response"
      : "multiple choice";
    const correctCount = isMultipleResponse ? "2-3" : "1";

    // Shorter, more focused prompt to avoid 431 error
    const prompt = `Generate AWS SAA exam question for "${domain}".

CRITICAL: Respond with ONLY valid JSON, no extra text or formatting.

Required JSON format:
{
  "question": "Your question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"${
    isMultipleResponse ? ', "Option E"' : ""
  }],
  "correct": ${isMultipleResponse ? "[0,1]" : "[0]"},
  "explanation": "Brief explanation"
}

Rules:
- ${questionType} question (${correctCount} correct answers)
- AWS Associate level
- Use double quotes only
- No trailing commas
- Valid JSON syntax`;

    try {
      const response = await this.callAPI(prompt);
      return this.parseQuestionResponse(
        response,
        domain,
        questionType,
        questionNumber
      );
    } catch (error) {
      console.error("Error generating question:", error);
      throw error;
    }
  }

  async callAPI(prompt) {
    const url = `${this.baseUrl}?key=${this.apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 431) {
        throw new Error("Request too large - using fallback question");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;

      // Print the raw Gemini AI response to console
      console.log("=== GEMINI AI RESPONSE ===");
      console.log("Raw Response:", aiResponse);
      console.log("Response Length:", aiResponse.length);
      console.log("========================");

      return aiResponse;
    } else {
      console.error("Invalid Gemini API response structure:", data);
      throw new Error("Invalid response format from Gemini API");
    }
  }

  parseQuestionResponse(response, domain, questionType, questionNumber) {
    console.log(`=== PARSING QUESTION ${questionNumber} ===`);
    console.log("Domain:", domain);
    console.log("Type:", questionType);
    console.log("Raw Response to Parse:", response);

    try {
      // Clean the response - remove markdown code blocks and extra text
      let cleanResponse = response.trim();

      // Remove markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\s*/g, "");
      cleanResponse = cleanResponse.replace(/```\s*/g, "");

      console.log("After markdown cleanup:", cleanResponse);

      // Find JSON object - look for { ... }
      const jsonStart = cleanResponse.indexOf("{");
      const jsonEnd = cleanResponse.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
        console.error("No valid JSON brackets found");
        throw new Error("No valid JSON found in response");
      }

      let jsonString = cleanResponse.substring(jsonStart, jsonEnd + 1);
      console.log("Extracted JSON string:", jsonString);

      let questionData;

      // First, try parsing the original JSON without any cleaning
      try {
        questionData = JSON.parse(jsonString);
        console.log("✅ Original JSON parsing successful:", questionData);
      } catch (originalError) {
        console.warn("❌ Original JSON parsing failed:", originalError.message);

        // Only if original parsing fails, apply conservative cleaning
        const cleanedJsonString = jsonString
          // Remove trailing commas before closing braces/brackets
          .replace(/,(\s*[}\]])/g, "$1")
          // Remove any trailing commas at the end
          .replace(/,\s*$/, "")
          // Fix multiple consecutive commas
          .replace(/,+/g, ",")
          // Handle malformed arrays (empty elements)
          .replace(/\[\s*,/g, "[")
          .replace(/,\s*\]/g, "]")
          // Remove control characters that might break parsing - fixed regex
          .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

        console.log("After conservative JSON cleaning:", cleanedJsonString);

        try {
          questionData = JSON.parse(cleanedJsonString);
          console.log("✅ Cleaned JSON parsing successful:", questionData);
        } catch (cleanedError) {
          // If both fail, try manual extraction
          console.warn(
            "❌ Cleaned JSON parsing also failed, attempting manual extraction:",
            cleanedError.message
          );
          questionData = this.extractDataManually(jsonString);
          console.log("✅ Manual extraction successful:", questionData);
        }
      }

      // Validate the parsed data
      if (!questionData || typeof questionData !== "object") {
        throw new Error("Invalid question data structure");
      }

      if (!questionData.question || typeof questionData.question !== "string") {
        throw new Error("Missing or invalid question text");
      }

      if (
        !Array.isArray(questionData.options) ||
        questionData.options.length < 3
      ) {
        throw new Error("Missing or invalid options array");
      }

      if (!questionData.correct) {
        throw new Error("Missing correct answer");
      }

      // Ensure correct is an array
      const correctArray = Array.isArray(questionData.correct)
        ? questionData.correct
        : [questionData.correct];

      // Validate correct answers are within bounds
      const validCorrect = correctArray.filter(
        (idx) =>
          typeof idx === "number" &&
          idx >= 0 &&
          idx < questionData.options.length
      );

      if (validCorrect.length === 0) {
        throw new Error("No valid correct answers found");
      }

      const finalQuestion = {
        id: questionNumber,
        question: questionData.question.trim(),
        options: questionData.options.map((opt) => String(opt).trim()),
        correct: validCorrect,
        explanation: questionData.explanation || "No explanation provided.",
        domain: domain,
        type: questionType,
      };

      console.log("✅ FINAL PARSED QUESTION:", finalQuestion);
      console.log("=====================================");

      return finalQuestion;
    } catch (error) {
      console.error("❌ Failed to parse question:", error);
      console.log("=====================================");
      throw new Error("Failed to parse AI response");
    }
  }

  extractDataManually(jsonString) {
    console.log("🔧 Starting manual extraction for:", jsonString);

    try {
      // Manual extraction as fallback with more robust patterns

      // Extract question - handle various quote patterns
      const questionPatterns = [
        /"question"\s*:\s*"([^"]+)"/,
        /"question"\s*:\s*'([^']+)'/,
        /"question"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/, // Handle escaped quotes
        /question\s*:\s*"([^"]+)"/, // Without quotes around key
      ];

      let questionMatch = null;
      for (const pattern of questionPatterns) {
        questionMatch = jsonString.match(pattern);
        if (questionMatch) break;
      }

      // Extract options - handle array patterns
      const optionsPatterns = [
        /"options"\s*:\s*\[(.*?)\]/s,
        /"options"\s*:\s*\[([^\]]+)\]/s,
        /options\s*:\s*\[(.*?)\]/s, // Without quotes around key
      ];

      let optionsMatch = null;
      for (const pattern of optionsPatterns) {
        optionsMatch = jsonString.match(pattern);
        if (optionsMatch) break;
      }

      // Extract correct answers - handle various formats - fixed regex
      const correctPatterns = [
        /"correct"\s*:\s*\[([^\]]+)\]/,
        /"correct"\s*:\s*(\d+)/,
        /"correct"\s*:\s*\[([^\]]*)\]/,
        /correct\s*:\s*\[([^\]]+)\]/, // Without quotes around key
        /correct\s*:\s*(\d+)/,
      ];

      let correctMatch = null;
      for (const pattern of correctPatterns) {
        correctMatch = jsonString.match(pattern);
        if (correctMatch) break;
      }

      // Extract explanation
      const explanationPatterns = [
        /"explanation"\s*:\s*"([^"]+)"/,
        /"explanation"\s*:\s*'([^']+)'/,
        /"explanation"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/, // Handle escaped quotes
        /explanation\s*:\s*"([^"]+)"/, // Without quotes around key
      ];

      let explanationMatch = null;
      for (const pattern of explanationPatterns) {
        explanationMatch = jsonString.match(pattern);
        if (explanationMatch) break;
      }

      console.log("Question match:", questionMatch);
      console.log("Options match:", optionsMatch);
      console.log("Correct match:", correctMatch);
      console.log("Explanation match:", explanationMatch);

      if (!questionMatch || !optionsMatch || !correctMatch) {
        throw new Error("Could not extract required fields manually");
      }

      // Parse options more robustly
      const optionsString = optionsMatch[1];
      const options = [];

      // Try multiple option parsing strategies
      const optionPatterns = [
        /"([^"]+)"/g, // Standard quoted strings
        /'([^']+)'/g, // Single quoted strings
        /([^,\[\]]+)/g, // Unquoted strings (fallback)
      ];

      for (const pattern of optionPatterns) {
        const matches = [...optionsString.matchAll(pattern)];
        if (matches.length >= 3) {
          // Need at least 3 options
          options.push(...matches.map((match) => match[1].trim()));
          break;
        }
      }

      // If still no options, try splitting by comma
      if (options.length === 0) {
        const splitOptions = optionsString
          .split(",")
          .map(
            (opt) => opt.trim().replace(/^["']|["']$/g, "") // Remove surrounding quotes
          )
          .filter((opt) => opt.length > 0);
        options.push(...splitOptions);
      }

      // Parse correct answers more robustly - fixed regex
      let correct;
      const correctString = correctMatch[1] || correctMatch[0];

      try {
        // Try parsing as JSON array first
        if (correctString.includes("[") || correctString.includes(",")) {
          correct = JSON.parse(`[${correctString.replace(/[[\]]/g, "")}]`);
        } else {
          correct = parseInt(correctString);
        }
      } catch {
        // Fallback: extract numbers
        const numbers = correctString.match(/\d+/g);
        if (numbers) {
          correct =
            numbers.length === 1
              ? parseInt(numbers[0])
              : numbers.map((n) => parseInt(n));
        } else {
          correct = 0; // Default fallback
        }
      }

      const result = {
        question: questionMatch[1].trim(),
        options: options.slice(0, 5), // Limit to max 5 options
        correct: correct,
        explanation: explanationMatch
          ? explanationMatch[1].trim()
          : "No explanation provided.",
      };

      console.log("✅ Manual extraction result:", result);
      return result;
    } catch (error) {
      console.error("❌ Manual extraction failed:", error);

      // Ultimate fallback - create a basic question from whatever we can find
      const fallbackQuestion = this.createUltimateFallback(jsonString);
      console.log("🆘 Using ultimate fallback:", fallbackQuestion);
      return fallbackQuestion;
    }
  }

  createUltimateFallback(jsonString) {
    // Extract any text that looks like a question
    const questionText = jsonString.match(/[A-Z][^?]*\?/) ||
      jsonString.match(/"([^"]*\?[^"]*)"/) || [
        "What is the best AWS practice for this scenario?",
      ];

    // Create basic AWS options
    const basicOptions = [
      "Amazon EC2",
      "Amazon S3",
      "Amazon RDS",
      "Amazon Lambda",
    ];

    return {
      question: Array.isArray(questionText) ? questionText[0] : questionText,
      options: basicOptions,
      correct: [0],
      explanation: "This is a fallback question due to parsing issues.",
    };
  }
}
