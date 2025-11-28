/**
 * @fileOverview An AI agent that suggests optimal server pairings based on current network conditions.
 */

import {ai} from '@/ai/genkit';
import {
    SuggestOptimalServerPairingsInputSchema,
    SuggestOptimalServerPairingsOutputSchema,
} from './types';


const prompt = ai.definePrompt({
  name: 'suggestOptimalServerPairingsPrompt',
  input: {schema: SuggestOptimalServerPairingsInputSchema},
  output: {schema: SuggestOptimalServerPairingsOutputSchema},
  prompt: `You are an AI network analyst tasked with suggesting optimal server pairings for cryptocurrency trading infrastructure based on network latency data.

You are provided with current and historical latency data between various exchange server locations across AWS, GCP, and Azure co-location regions.

Analyze the provided data to identify patterns, anomalies, and trends that may affect trading performance. Consider factors such as latency ranges, historical stability, and potential network congestion.

Based on your analysis, suggest optimal server pairings that minimize latency and maximize trading efficiency. Provide a clear and concise summary of your analysis, explaining the reasoning behind your suggestions.

Current Latency Data: {{{currentLatencyData}}}
Historical Latency Data: {{{historicalLatencyData}}}

Output the suggested server pairings as a JSON string and the analysis summary as a plain text string.
`,
});

export const suggestOptimalServerPairingsFlow = ai.defineFlow(
  {
    name: 'suggestOptimalServerPairingsFlow',
    inputSchema: SuggestOptimalServerPairingsInputSchema,
    outputSchema: SuggestOptimalServerPairingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);