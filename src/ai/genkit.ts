import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';

config();

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    `[WARN] GEMINI_API_KEY is not set.
    You can get one from Google AI Studio and set it in your .env file.
    https://aistudio.google.com/app/apikey
    Falling back to developer authentication.`
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
