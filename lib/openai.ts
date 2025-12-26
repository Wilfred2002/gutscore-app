import { OpenAI } from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Initialize OpenAI client
// Note: In a production app, you should proxy requests through your own backend
// to avoid exposing API keys. For MVP/Expo Go, we use the client directly but
// this is not secure for production distribution.
const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true, // Required for React Native/Expo
});

export interface AIAnalysisResult {
  foods: Array<{
    name: string;
    confidence: number;
    emoji: string;
    description: string;
  }>;
  gutScores: {
    fodmap: number;
    fermentation: number;
    fiber_diversity: number;
    probiotic: number;
  };
  overallScore: number;
  analysis: string[];
  triggers: string[];
  swaps: Array<{
    name: string;
    emoji: string;
    scoreIncrease: number;
    reason: string;
  }>;
}

export const analyzeFoodImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    console.warn('OpenAI API key is missing. Returning mock data.');
    return getMockAnalysis();
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective vision model
      messages: [
        {
          role: "system",
          content: `You are a gut health expert AI. Analyze the food in the image for IBS/gut health impact.
          Return a JSON object with the following structure:
          {
            "foods": [{"name": "Food Name", "confidence": 0-100, "emoji": "🥗", "description": "short text"}],
            "gutScores": {
              "fodmap": 0-100 (0=safe, 100=high risk),
              "fermentation": 0-100 (gas potential),
              "fiber_diversity": 0-10 (plant variety score),
              "probiotic": 0-5 (fermented food score)
            },
            "overallScore": 0-100 (100 = perfect for gut health),
            "analysis": ["Bullet point 1", "Bullet point 2"],
            "triggers": ["Potential trigger 1 (e.g. lactose)"],
            "swaps": [{"name": "Alternative Food", "emoji": "🥕", "scoreIncrease": 10, "reason": "why better"}]
          }
          Be conservative with FODMAP ratings. Accurately identify ingredients.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this meal for gut health." },
            {
              type: "image_url",
              image_url: {
                "url": `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No analysis returned');

    return JSON.parse(content) as AIAnalysisResult;

  } catch (error) {
    console.error('OpenAI Analysis failed:', error);
    // Fallback to mock data if API fails
    return getMockAnalysis();
  }
};

const getMockAnalysis = (): AIAnalysisResult => ({
  foods: [
    { name: "Unknown Meal (Mock)", confidence: 80, emoji: "🍽️", description: "Could not analyze image." }
  ],
  gutScores: {
    fodmap: 50,
    fermentation: 50,
    fiber_diversity: 5,
    probiotic: 0,
  },
  overallScore: 75,
  analysis: ["AI analysis failed. Please check your internet connection or API key."],
  triggers: [],
  swaps: [],
});

interface GutCoachContext {
  triggers: string[];
  recentMeals: string[];
  symptomTypes: string[];
}

export const chatWithGutCoach = async (
  message: string,
  context: GutCoachContext
): Promise<string> => {
  if (!apiKey) {
    return "I'm currently in demo mode. To get personalized advice, please set up your OpenAI API key.";
  }

  try {
    const systemPrompt = `You are a friendly, knowledgeable gut health coach helping someone with IBS/digestive issues.

User's known trigger foods: ${context.triggers.join(', ') || 'None detected yet'}
Recent meals logged: ${context.recentMeals.join('; ') || 'No meals logged'}
Common symptoms: ${context.symptomTypes.join(', ') || 'None logged'}

Guidelines:
- Be supportive and educational
- Reference their known triggers when relevant
- Give practical, actionable advice
- Keep responses concise (2-3 paragraphs max)
- If asked about specific foods, explain the gut health impact
- Suggest alternatives when mentioning problematic foods
- Never diagnose or replace medical advice`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Chat error:', error);
    return "Sorry, I'm having trouble connecting. Please check your internet connection and try again.";
  }
};

export const analyzeFoodList = async (foods: string[]): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    console.warn('OpenAI API key is missing. Returning mock data for food list.');
    return {
      foods: foods.map(f => ({ name: f, confidence: 90, emoji: '🍽️', description: 'Logged via Quick Log' })),
      gutScores: { fodmap: 40, fermentation: 30, fiber_diversity: 5, probiotic: 0 },
      overallScore: 75,
      analysis: ['This meal was logged via Quick Log. Scores are estimated.'],
      triggers: [],
      swaps: [],
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a gut health expert AI. Analyze these foods for IBS/gut health impact.
          Return a JSON object with the following structure:
          {
            "foods": [{"name": "Food Name", "confidence": 90, "emoji": "🥗", "description": "short text"}],
            "gutScores": {
              "fodmap": 0-100 (0=safe, 100=high risk),
              "fermentation": 0-100 (gas potential),
              "fiber_diversity": 0-10 (plant variety score),
              "probiotic": 0-5 (fermented food score)
            },
            "overallScore": 0-100 (100 = perfect for gut health),
            "analysis": ["Bullet point 1", "Bullet point 2"],
            "triggers": ["Potential trigger 1 (e.g. lactose)"],
            "swaps": [{"name": "Alternative Food", "emoji": "🥕", "scoreIncrease": 10, "reason": "why better"}]
          }`
        },
        {
          role: "user",
          content: `Analyze this meal for gut health. Foods: ${foods.join(', ')}`
        }
      ],
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No analysis returned');

    return JSON.parse(content) as AIAnalysisResult;
  } catch (error) {
    console.error('Food list analysis failed:', error);
    return {
      foods: foods.map(f => ({ name: f, confidence: 80, emoji: '🍽️', description: 'Analysis failed' })),
      gutScores: { fodmap: 50, fermentation: 50, fiber_diversity: 5, probiotic: 0 },
      overallScore: 70,
      analysis: ['AI analysis failed. Please try again.'],
      triggers: [],
      swaps: [],
    };
  }
};
