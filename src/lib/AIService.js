const GEMINI_MODEL = 'gemini-1.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

class GeminiChatSession {
  constructor(service, context) {
    this.service = service
    this.context = context
    this.history = []
  }

  async sendMessage(message) {
    this.history.push({ role: 'user', text: message })

    const transcript = this.history
      .map((entry) => `${entry.role === 'model' ? 'Assistant' : 'User'}: ${entry.text}`)
      .join('\n\n')

    const responseText = await this.service.generateText({
      systemInstruction: `You are an expert personalized Type 1 Diabetes AI assistant integrated into the Betatrace app.
You answer questions about the user's diabetes data, trends, meals, insulin logs, and Nightscout-connected glucose history.
Be empathetic, concise, and analytical.
Do not give definitive medical instructions or override professional care. When the topic could affect treatment decisions, include a brief safety disclaimer.

Recent user context:
${JSON.stringify(this.context, null, 2)}`,
      prompt: `Continue the existing conversation naturally.

Conversation so far:
${transcript}`,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
    })

    this.history.push({ role: 'model', text: responseText })

    return {
      response: {
        text: () => responseText,
      },
    }
  }
}

export class AIService {
  constructor(apiKey) {
    this.apiKey = typeof apiKey === 'string' ? apiKey.trim() : ''
  }

  isConfigured() {
    return Boolean(this.apiKey)
  }

  async generateText({ prompt, systemInstruction, generationConfig }) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please add your key in Settings.')
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(this.apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(systemInstruction
          ? {
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
            }
          : {}),
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig,
      }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.error?.message || `Gemini request failed with HTTP ${response.status}`
      throw new Error(message)
    }

    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim()

    if (!text) {
      throw new Error('Gemini returned an empty response.')
    }

    return text
  }

  async getDoseRecommendation(context) {
    if (!this.isConfigured()) {
      return { error: 'Gemini API not configured. Please add your key in Settings.' }
    }

    try {
      const responseText = await this.generateText({
        prompt: `You are an AI assistant for a Type 1 Diabetic built for the Betatrace platform.
Your task is to analyze the user's context (recent glucose readings, meals, and current insulin load) and recommend an insulin dose for an upcoming meal or correction.

IMPORTANT MEDICAL DISCLAIMER: This is an estimation simulation.
Return your response as a valid JSON object matching this structure EXACTLY. Do not include markdown formatting or backticks around the JSON.

{
  "recommendedUnits": 4.5,
  "confidenceScore": 85,
  "reasoning": "Brief explanation of how you arrived at this number."
}

User Context:
${JSON.stringify(context, null, 2)}`,
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.4,
        },
      })

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        return { error: 'Failed to parse AI response format.' }
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('AI Error:', error)
      return { error: error.message }
    }
  }

  async analyzePatterns(history) {
    if (!this.isConfigured()) {
      return null
    }

    try {
      return await this.generateText({
        prompt: `You are a Type 1 Diabetes pattern analysis AI built for Betatrace.
Analyze the following user data (glucose, meals, insulin).
Identify 1 or 2 useful insights or patterns (for example "You often experience a spike after breakfast" or "Your target range consistency is great in the evenings").
Keep it concise, encouraging, and short (max 2 sentences).

History:
${JSON.stringify(history, null, 2)}`,
        generationConfig: {
          maxOutputTokens: 220,
          temperature: 0.6,
        },
      })
    } catch (error) {
      console.error('AI Error:', error)
      return null
    }
  }

  async startChatSession(context) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please add your key in Settings.')
    }

    return new GeminiChatSession(this, context)
  }
}
