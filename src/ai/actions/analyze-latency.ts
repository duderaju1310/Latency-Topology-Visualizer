'use server';

import { analyzeLatencyDataFlow } from '../flows/intelligent-latency-alert';
import type { AnalyzeLatencyDataInput, AnalyzeLatencyDataOutput } from '../flows/types';

export async function analyzeLatencyData(input: AnalyzeLatencyDataInput): Promise<AnalyzeLatencyDataOutput> {
  return analyzeLatencyDataFlow(input);
}