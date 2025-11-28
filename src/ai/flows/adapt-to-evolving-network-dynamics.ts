/**
 * @fileOverview An AI agent that adapts to evolving network dynamics by learning from historical latency data.
 */

import {ai} from '@/ai/genkit';
import {
    AdaptToEvolvingNetworkDynamicsInputSchema,
    AdaptToEvolvingNetworkDynamicsOutputSchema,
} from './types';

const prompt = ai.definePrompt({
  name: 'adaptToEvolvingNetworkDynamicsPrompt',
  input: {schema: AdaptToEvolvingNetworkDynamicsInputSchema},
  output: {schema: AdaptToEvolvingNetworkDynamicsOutputSchema},
  prompt: `You are an expert network performance optimizer. Analyze the provided historical latency data and current server configurations to suggest optimal server pairings and routing adjustments.

Historical Latency Data: {{{historicalLatencyData}}}

Current Server Configurations: {{{currentServerConfigurations}}}

Based on this information, provide the following in JSON format:

1.  Suggested optimal server pairings based on current network conditions.
2.  Suggested routing adjustments to maintain optimal performance.
3.  A summary of your analysis and suggestions.
`,
});

export const adaptToEvolvingNetworkDynamicsFlow = ai.defineFlow(
  {
    name: 'adaptToEvolvingNetworkDynamicsFlow',
    inputSchema: AdaptToEvolvingNetworkDynamicsInputSchema,
    outputSchema: AdaptToEvolvingNetworkDynamicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);