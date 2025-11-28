'use client';

import React from 'react';
import { LatencyData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { exchanges, cloudRegions } from '@/lib/data';

type HeatmapViewProps = {
  latencyData: LatencyData[];
};

const getLatencyClasses = (latency: number): string => {
    if (latency < 50) return 'bg-green-500/80 text-white';
    if (latency < 150) return 'bg-yellow-400/80 text-gray-900';
    return 'bg-red-500/80 text-white';
};

export default function HeatmapView({ latencyData }: HeatmapViewProps) {
  const latencyMap = new Map<string, number>();
  latencyData.forEach(d => {
    latencyMap.set(`${d.from}-${d.to}`, d.latency);
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-2xl font-bold text-foreground">Latency Heatmap</h1>
      <p className="text-muted-foreground">
        A 2D matrix visualizing the latency between exchanges and cloud regions.
      </p>
      <Card className="flex-grow overflow-auto">
        <CardHeader>
          <CardTitle>Exchange-to-Region Latency Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-tl-lg">
                    Exchange
                  </th>
                  {cloudRegions.map(region => (
                    <th key={region.id} scope="col" className="px-6 py-3 text-center">
                      {region.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exchanges.map(exchange => (
                  <tr key={exchange.id} className="border-b border-border">
                    <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap text-foreground">
                      {exchange.name}
                    </th>
                    {cloudRegions.map(region => {
                      const latency = latencyMap.get(`${exchange.id}-${region.id}`);
                      return (
                        <td key={region.id} className="px-2 py-1 text-center">
                          {latency !== undefined ? (
                            <div className={`w-full h-full p-2 rounded-md font-semibold ${getLatencyClasses(latency)}`}>
                              {latency.toFixed(0)}ms
                            </div>
                          ) : (
                            <div className="p-2 rounded-md bg-muted/20">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

