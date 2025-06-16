// Sample AWS exam questions for testing
export const sampleQuestions = [
  {
    id: 1,
    question:
      "Which AWS service provides scalable compute capacity in the cloud?",
    options: ["Amazon EC2", "Amazon S3", "Amazon RDS", "Amazon VPC"],
    correct: [0],
    explanation:
      "Amazon EC2 (Elastic Compute Cloud) provides scalable compute capacity in the AWS cloud.",
    domain: "Design High-Performing Architectures",
    type: "multiple choice",
  },
  {
    id: 2,
    question:
      "Which AWS services provide network-level security for your VPC? (Select all that apply)",
    options: [
      "Security Groups",
      "Network ACLs",
      "AWS WAF",
      "AWS Shield",
      "VPC Flow Logs",
    ],
    correct: [0, 1],
    explanation:
      "Security Groups provide instance-level security, while Network ACLs provide subnet-level security.",
    domain: "Design Secure Applications and Architectures",
    type: "multiple response",
  },
  {
    id: 3,
    question:
      "What is the most cost-effective storage option for long-term archival?",
    options: ["S3 Standard", "S3 Glacier", "S3 Deep Archive", "EBS"],
    correct: [2],
    explanation:
      "S3 Deep Archive is the lowest-cost storage class, designed for long-term retention.",
    domain: "Design Cost-Optimized Architectures",
    type: "multiple choice",
  },
];

export const sampleAnswers = {
  0: 0, // Question 1: Answer A (Amazon EC2)
  1: [0, 1], // Question 2: Answers A and B (Security Groups, Network ACLs)
  2: 2, // Question 3: Answer C (S3 Deep Archive)
};

export const sampleResults = {
  correct: 3,
  total: 3,
  percentage: 100,
  score: 1000,
  passed: true,
  timeTaken: {
    minutes: 15,
    seconds: 30,
    totalMs: 930000,
  },
  domainStats: {
    "Design Secure Applications and Architectures": { correct: 1, total: 1 },
    "Design Resilient Architectures": { correct: 0, total: 0 },
    "Design High-Performing Architectures": { correct: 1, total: 1 },
    "Design Cost-Optimized Architectures": { correct: 1, total: 1 },
  },
};

export const mockGeminiResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `{
              "question": "Which AWS service is used for DNS resolution?",
              "options": ["Route 53", "CloudFront", "ELB", "VPC"],
              "correct": [0],
              "explanation": "Amazon Route 53 is a scalable DNS web service."
            }`,
          },
        ],
      },
    },
  ],
};

export const awsDomainsTestData = [
  "Design Secure Applications and Architectures",
  "Design Resilient Architectures",
  "Design High-Performing Architectures",
  "Design Cost-Optimized Architectures",
];
