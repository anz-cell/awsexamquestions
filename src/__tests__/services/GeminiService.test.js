import { GeminiService } from '../../src/services/GeminiService';
import { mockGeminiResponse } from '../fixtures/sampleQuestions';

// Mock fetch globally
global.fetch = jest.fn();

describe('GeminiService', () => {
  let geminiService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    geminiService = new GeminiService(mockApiKey);
    fetch.mockClear();
  });

  describe('constructor', () => {
    test('should initialize with correct API key and base URL', () => {
      expect(geminiService.apiKey).toBe(mockApiKey);
      expect(geminiService.baseUrl).toBe(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
      );
    });
  });

  describe('generateQuestion', () => {
    test('should generate a multiple choice question successfully', async () => {
      const mockResponse = {
        question: 'Which AWS service provides compute capacity?',
        options: ['EC2', 'S3', 'RDS', 'VPC'],
        correct: [0],
        explanation: 'EC2 provides compute capacity.'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeminiResponse
      });

      // Mock the parseQuestionResponse method
      geminiService.parseQuestionResponse = jest.fn().mockReturnValue({
        id: 1,
        question: mockResponse.question,
        options: mockResponse.options,
        correct: mockResponse.correct,
        explanation: mockResponse.explanation,
        domain: 'Design High-Performing Architectures',
        type: 'multiple choice'
      });

      const result = await geminiService.generateQuestion(
        'Design High-Performing Architectures',
        false,
        1
      );

      expect(result).toEqual({
        id: 1,
        question: mockResponse.question,
        options: mockResponse.options,
        correct: mockResponse.correct,
        explanation: mockResponse.explanation,
        domain: 'Design High-Performing Architectures',
        type: 'multiple choice'
      });
    });

    test('should generate a multiple response question successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeminiResponse
      });

      geminiService.parseQuestionResponse = jest.fn().mockReturnValue({
        id: 1,
        question: 'Which services provide security?',
        options: ['Security Groups', 'NACLs', 'WAF', 'Shield', 'CloudTrail'],
        correct: [0, 1],
        explanation: 'Security Groups and NACLs provide network security.',
        domain: 'Design Secure Applications and Architectures',
        type: 'multiple response'
      });

      const result = await geminiService.generateQuestion(
        'Design Secure Applications and Architectures',
        true,
        1
      );

      expect(result.type).toBe('multiple response');
      expect(result.correct).toEqual([0, 1]);
    });

    test('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal Server Error' } })
      });

      await expect(
        geminiService.generateQuestion('Design High-Performing Architectures', false, 1)
      ).rejects.toThrow('Internal Server Error');
    });

    test('should handle 431 Request Too Large error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 431
      });

      await expect(
        geminiService.generateQuestion('Design High-Performing Architectures', false, 1)
      ).rejects.toThrow('Request too large - using fallback question');
    });
  });

  describe('callAPI', () => {
    test('should make successful API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeminiResponse
      });

      const result = await geminiService.callAPI('test prompt');

      expect(fetch).toHaveBeenCalledWith(
        `${geminiService.baseUrl}?key=${mockApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'test prompt'
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        }
      );

      expect(result).toBe(mockGeminiResponse.candidates[0].content.parts[0].text);
    });

    test('should handle invalid response structure', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });

      await expect(geminiService.callAPI('test prompt')).rejects.toThrow(
        'Invalid response format from Gemini API'
      );
    });
  });

  describe('parseQuestionResponse', () => {
    test('should parse valid JSON response', () => {
      const validResponse = `{
        "question": "Which AWS service provides DNS?",
        "options": ["Route 53", "CloudFront", "ELB", "VPC"],
        "correct": [0],
        "explanation": "Route 53 is AWS DNS service."
      }`;

      const result = geminiService.parseQuestionResponse(
        validResponse,
        'Design High-Performing Architectures',
        'multiple choice',
        1
      );

      expect(result).toEqual({
        id: 1,
        question: 'Which AWS service provides DNS?',
        options: ['Route 53', 'CloudFront', 'ELB', 'VPC'],
        correct: [0],
        explanation: 'Route 53 is AWS DNS service.',
        domain: 'Design High-Performing Architectures',
        type: 'multiple choice'
      });
    });

    test('should handle JSON with markdown code blocks', () => {
      const responseWithMarkdown = `
      \`\`\`json
      {
        "question": "Which AWS service provides DNS?",
        "options": ["Route 53", "CloudFront", "ELB", "VPC"],
        "correct": [0],
        "explanation": "Route 53 is AWS DNS service."
      }
      \`\`\`
      `;

      const result = geminiService.parseQuestionResponse(
        responseWithMarkdown,
        'Design High-Performing Architectures',
        'multiple choice',
        1
      );

      expect(result.question).toBe('Which AWS service provides DNS?');
    });

    test('should handle malformed JSON', () => {
      const malformedResponse = `{
        "question": "Which AWS service provides DNS?",
        "options": ["Route 53", "CloudFront", "ELB", "VPC",],
        "correct": [0],
        "explanation": "Route 53 is AWS DNS service."
      }`;

      const result = geminiService.parseQuestionResponse(
        malformedResponse,
        'Design High-Performing Architectures',
        'multiple choice',
        1
      );

      expect(result.question).toBe('Which AWS service provides DNS?');
    });

    test('should throw error for invalid response', () => {
      const invalidResponse = 'This is not JSON';

      expect(() => {
        geminiService.parseQuestionResponse(
          invalidResponse,
          'Design High-Performing Architectures',
          'multiple choice',
          1
        );
      }).toThrow('Failed to parse AI response');
    });
  });

  describe('extractDataManually', () => {
    test('should extract question data manually', () => {
      const jsonString = `{
        "question": "What is EC2?",
        "options": ["Compute", "Storage", "Network", "Database"],
        "correct": [0],
        "explanation": "EC2 is compute service."
      }`;

      const result = geminiService.extractDataManually(jsonString);

      expect(result).toEqual({
        question: 'What is EC2?',
        options: ['Compute', 'Storage', 'Network', 'Database'],
        correct: 0,
        explanation: 'EC2 is compute service.'
      });
    });

    test('should handle complex extraction scenarios', () => {
      const complexJsonString = `{
        "question": "Which services provide security?",
        "options": ["Security Groups", "NACLs", "WAF", "Shield"],
        "correct": [0, 1],
        "explanation": "Security Groups and NACLs provide network security."
      }`;

      const result = geminiService.extractDataManually(complexJsonString);

      expect(result.question).toBe('Which services provide security?');
      expect(result.options).toEqual(['Security Groups', 'NACLs', 'WAF', 'Shield']);
    });
  });

  describe('createUltimateFallback', () => {
    test('should create fallback question', () => {
      const result = geminiService.createUltimateFallback('invalid json string');

      expect(result).toEqual({
        question: 'What is the best AWS practice for this scenario?',
        options: ['Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon Lambda'],
        correct: [0],
        explanation: 'This is a fallback question due to parsing issues.'
      });
    });

    test('should extract question from string if possible', () => {
      const jsonString = 'What is the best storage option for this scenario?';

      const result = geminiService.createUltimateFallback(jsonString);

      expect(result.question).toBe('What is the best storage option for this scenario?');
    });
  });
}); 