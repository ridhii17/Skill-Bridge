import config from '../config/index.js';

/**
 * LLM Client — singleton for making API calls to an OpenAI-compatible endpoint.
 * Handles retry, timeout, JSON parsing, and fallback detection.
 * API key stays server-side only.
 */

const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000;

class AIClient {
  constructor() {
    this.apiKey = config.llm.apiKey;
    this.baseUrl = config.llm.baseUrl;
    this.model = config.llm.model;
    this.isAvailable = !!this.apiKey;
  }

  /**
   * Send a chat completion request
   * @param {string} systemPrompt
   * @param {string} userMessage
   * @param {object} options - { temperature, maxTokens, responseFormat }
   * @returns {Promise<{content: string, success: boolean, error?: string}>}
   */
  async chat(systemPrompt, userMessage, options = {}) {
    if (!this.isAvailable) {
      return { content: '', success: false, error: 'AI API key not configured', fallback: true };
    }

    const { temperature = 0.7, maxTokens = 2000, responseFormat = null } = options;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const body = {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature,
          max_tokens: maxTokens,
        };

        if (responseFormat === 'json') {
          body.response_format = { type: 'json_object' };
        }

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text().catch(() => 'Unknown error');
          console.error(`AI API error (attempt ${attempt + 1}):`, response.status, errText);
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          return { content: '', success: false, error: `AI API error: ${response.status}` };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        if (!content) {
          return { content: '', success: false, error: 'Empty AI response' };
        }

        return { content, success: true };
      } catch (err) {
        console.error(`AI API error (attempt ${attempt + 1}):`, err.message);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        return { content: '', success: false, error: err.message };
      }
    }

    return { content: '', success: false, error: 'Max retries exceeded' };
  }

  /**
   * Chat with JSON response parsing
   */
  async chatJSON(systemPrompt, userMessage, options = {}) {
    const result = await this.chat(systemPrompt, userMessage, { ...options, responseFormat: 'json' });

    if (!result.success) return { ...result, parsed: null };

    try {
      // Try to extract JSON from the response
      let jsonStr = result.content.trim();

      // Remove markdown code fences if present
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      // Try to find JSON object or array
      const objStart = jsonStr.indexOf('{');
      const arrStart = jsonStr.indexOf('[');
      let start = -1;
      if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) start = objStart;
      else if (arrStart >= 0) start = arrStart;

      if (start >= 0) {
        jsonStr = jsonStr.slice(start);
      }

      const parsed = JSON.parse(jsonStr);
      return { ...result, parsed };
    } catch (err) {
      console.error('Failed to parse AI JSON response:', err.message);
      return { ...result, parsed: null, parseError: true };
    }
  }
}

// Singleton
const aiClient = new AIClient();
export default aiClient;
