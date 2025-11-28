'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { analyzeLatencyData } from '@/ai/actions/analyze-latency';
import { getHistoricalLatency } from '@/lib/data';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LatencyData } from '@/lib/types';
import type { AnalyzeLatencyDataOutput } from '@/ai/flows/types';

type LatencyAlertsProps = {
  latencyData: LatencyData[];
};


export default function LatencyAlerts({ latencyData }: LatencyAlertsProps) {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeLatencyDataOutput | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);
    try {
      const historicalData = getHistoricalLatency('all', 7);

      const result = await analyzeLatencyData({
        realtimeLatencyData: JSON.stringify(latencyData),
        historicalLatencyData: JSON.stringify(historicalData),
      });

      setAnalysisResult(result);
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "The AI analysis could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAnalysis} disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Analyze Network Latency
      </Button>
      {analysisResult && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Alerts</h4>
            {analysisResult.alerts.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {analysisResult.alerts.map((alert: any, index: number) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                        <div className="flex items-center gap-2 text-left">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-grow">{alert.message}</span>
                            <Badge variant={getSeverityVariant(alert.severity)}>{alert.severity}</Badge>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <strong>Suggested Action:</strong> {alert.suggestedAction}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            ) : <p className="text-sm text-muted-foreground">No alerts found. Network is stable.</p>}
          </div>
           <div>
            <h4 className="font-semibold mb-2">Optimal Server Pairings</h4>
            <p className="text-sm text-muted-foreground">{analysisResult.optimalServerPairings}</p>
          </div>
        </div>
      )}
    </div>
  );
}

