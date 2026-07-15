const { GoogleGenAI } = require('@google/genai');
const env = require('./env');

if (!env.geminiApiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not set. Gemini API calls will fail.');
}

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

module.exports = { ai };
