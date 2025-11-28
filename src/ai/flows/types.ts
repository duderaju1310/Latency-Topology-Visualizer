
import { z } from 'zod';

// Types for intelligent-latency-alert.ts
export const AnalyzeLatencyDataInputSchema = z.object({
  realtimeLatencyData: z.string().describe('Real-time latency data in JSON format.'),
  historicalLatencyData: z.string().describe('Historical latency data in JSON format.'),
});
export type AnalyzeLatencyDataInput = z.infer<typeof AnalyzeLatencyDataInputSchema>;

export const AnalyzeLatencyDataOutputSchema = z.object({
  alerts: z.array(
    z.object({
      severity: z.enum(['high', 'medium', 'low']).describe('Severity of the alert.'),
      message: z.string().describe('Description of the potential issue.'),
      suggestedAction: z.string().describe('Suggested action to mitigate the issue.'),
    })
  ).describe('A list of alerts based on the latency analysis.'),
  optimalServerPairings: z.string().describe('Suggested optimal server pairings based on current network conditions.'),
});
export type AnalyzeLatencyDataOutput = z.infer<typeof AnalyzeLatencyDataOutputSchema>;


// Types for suggest-optimal-server-pairings.ts
export const SuggestOptimalServerPairingsInputSchema = z.object({
  currentLatencyData: z.string().describe('A JSON string containing current latency data between server pairs.'),
  historicalLatencyData: z.string().describe('A JSON string containing historical latency data between server pairs.'),
});
export type SuggestOptimalServerPairingsInput = z.infer<typeof SuggestOptimalServerPairingsInputSchema>;

export const SuggestOptimalServerPairingsOutputSchema = z.object({
  suggestedServerPairings: z.string().describe('A JSON string containing suggested optimal server pairings based on AI analysis.'),
  analysisSummary: z.string().describe('A summary of the AI analysis used to determine the optimal pairings.'),
});
export type SuggestOptimalServerPairingsOutput = z.infer<typeof SuggestOptimalServerPairingsOutputSchema>;


// Types for adapt-to-evolving-network-dynamics.ts
export const AdaptToEvolvingNetworkDynamicsInputSchema = z.object({
  historicalLatencyData: z.string().describe('Historical latency data between exchange servers and cloud regions, in JSON format.'),
  currentServerConfigurations: z.string().describe('Current server configurations and routing rules, in JSON format.'),
});
export type AdaptToEvolvingNetworkDynamicsInput = z.infer<typeof AdaptToEvolvingNetworkDynamicsInputSchema>;

export const AdaptToEvolvingNetworkDynamicsOutputSchema = z.object({
  suggestedServerPairings: z.string().describe('Suggested optimal server pairings based on current network conditions, in JSON format.'),
  suggestedRoutingAdjustments: z.string().describe('Suggested routing adjustments to maintain optimal performance, in JSON format.'),
  analysisSummary: z.string().describe('A summary of the analysis of historical latency data and suggested adjustments.'),
});
export type AdaptToEvolvingNetworkDynamicsOutput = z.infer<typeof AdaptToEvolvingNetworkDynamicsOutputSchema>;
