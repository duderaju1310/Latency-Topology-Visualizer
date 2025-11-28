/**
 * @fileOverview An AI agent that analyzes latency data and provides alerts.
 */

import {ai} from '@/ai/genkit';
import {
    AnalyzeLatencyDataInputSchema,
    AnalyzeLatencyDataOutputSchema,
} from './types';


const analyzeLatencyDataPrompt = ai.definePrompt({
  name: 'analyzeLatencyDataPrompt',
  input: {schema: AnalyzeLatencyDataInputSchema},
  output: {schema: AnalyzeLatencyDataOutputSchema},
  prompt: `You are an AI system administrator analyzing network latency data to identify potential issues in a cryptocurrency trading infrastructure.

  Analyze the provided real-time and historical latency data to identify patterns, anomalies, and potential risks that could affect trading performance.

  Based on your analysis, generate a list of alerts with severity levels (high, medium, low), descriptive messages, and suggested actions to mitigate the issues.

  Also, suggest optimal server pairings based on current network conditions to improve latency.

  Real-time Latency Data: {{{realtimeLatencyData}}}
  Historical Latency Data: {{{historicalLatencyData}}}

  Ensure that the alerts are specific, actionable, and relevant to maintaining a stable and efficient trading environment.
  Optimal Server Pairings: Explain with what pairings can improve latency.

  Output the analysis in JSON format. Follow the schema:
  ${JSON.stringify(AnalyzeLatencyDataOutputSchema)}
`,
});

export const analyzeLatencyDataFlow = ai.defineFlow(
  {
    name: 'analyzeLatencyDataFlow',
    inputSchema: AnalyzeLatencyDataInputSchema,
    outputSchema: AnalyzeLatencyDataOutputSchema,
  },
  async input => {
    try {
      const {output} = await analyzeLatencyDataPrompt(input);
      return output!;
    } catch (error) {
      console.error('Error in analyzeLatencyDataFlow:', error);
      throw new Error(`Failed to analyze latency data: ${error}`);
    }
  }
);
