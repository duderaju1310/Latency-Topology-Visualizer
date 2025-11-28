
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getHistoricalLatency, exchanges, cloudRegions } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';

const chartConfig = {
  latency: {
    label: 'Latency (ms)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const serverPairs = exchanges.flatMap(exchange => 
    cloudRegions.map(region => ({
        value: `${exchange.id}-${region.id}`,
        label: `${exchange.name} -> ${region.name}`
    }))
);

export default function LatencyChart() {
  const [pair, setPair] = useState(serverPairs[0].value);
  const [timeRange, setTimeRange] = useState(24 * 7); // hours
  const [chartData, setChartData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (isMounted) {
      const data = getHistoricalLatency(pair, timeRange);
      setChartData(data);
    }
  }, [pair, timeRange, isMounted]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0, avg: 0 };
    const latencies = chartData.map(d => d.latency);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    return { min, max, avg };
  }, [chartData]);

  const timeRanges = [
    { label: '1h', value: 1 },
    { label: '24h', value: 24 },
    { label: '7d', value: 24 * 7 },
    { label: '30d', value: 24 * 30 },
  ];

  if (!isMounted) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <Select value={pair} onValueChange={setPair}>
          <SelectTrigger className="w-full sm:w-auto flex-grow min-w-[200px]">
            <SelectValue placeholder="Select a pair" />
          </SelectTrigger>
          <SelectContent>
            {serverPairs.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 flex-shrink-0">
          {timeRanges.map(({label, value}) => (
            <Button
              key={label}
              variant={timeRange === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="text-xs text-muted-foreground flex justify-around mb-2">
          <span>Min: {stats.min.toFixed(2)}ms</span>
          <span>Avg: {stats.avg.toFixed(2)}ms</span>
          <span>Max: {stats.max.toFixed(2)}ms</span>
      </div>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={false} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
              <Tooltip 
                  cursor={false}
                  content={
                    <ChartTooltipContent 
                      indicator="dot" 
                      labelFormatter={(value) => format(new Date(value), 'PPpp')}
                    />
                  }
              />
              <Bar dataKey="latency" fill="var(--color-latency)" radius={2} />
            </BarChart>
          </ChartContainer>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
