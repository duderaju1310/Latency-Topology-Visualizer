'use client';

import React from 'react';
import { exchanges, cloudRegions } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Server, Globe } from 'lucide-react';

const providerColors: Record<string, string> = {
    AWS: 'text-[#FF9900]',
    GCP: 'text-[#4285F4]',
    Azure: 'text-[#0078D4]',
  };
  
const providerBorders: Record<string, string> = {
    AWS: 'border-[#FF9900]',
    GCP: 'border-[#4285F4]',
    Azure: 'border-[#0078D4]',
};

export default function TopologyView() {
  const topology = exchanges.reduce((acc, exchange) => {
    if (!acc[exchange.provider]) {
      acc[exchange.provider] = [];
    }
    acc[exchange.provider].push(exchange);
    return acc;
  }, {} as Record<string, typeof exchanges>);

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-2xl font-bold text-foreground">Network Topology</h1>
      <p className="text-muted-foreground">
        Visualizing logical connections between exchanges through their common cloud providers.
      </p>
      <div className="space-y-8">
        {Object.entries(topology).map(([provider, providerExchanges]) => (
          <Card key={provider} className={`overflow-hidden ${providerBorders[provider]}`}>
            <CardHeader className="flex flex-row items-center gap-4 bg-muted/30">
              <Share2 className={`h-8 w-8 ${providerColors[provider]}`} />
              <div>
                <CardTitle className="text-xl">{provider} Topology</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-around gap-8">
                    {/* Exchanges Column */}
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-lg font-semibold text-muted-foreground">Exchanges</h3>
                        <div className="flex flex-col gap-4">
                            {providerExchanges.map(exchange => (
                                <div key={exchange.id} className="flex items-center gap-2 p-3 rounded-lg bg-card border">
                                    <Globe className="h-5 w-5 text-primary" />
                                    <span className="font-medium">{exchange.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connection Lines */}
                    <div className="flex-grow relative h-full min-h-24 hidden md:block">
                        <svg width="100%" height="100%" className="absolute inset-0">
                            {providerExchanges.map((_, index) => {
                                const y = `${(index + 0.5) / providerExchanges.length * 100}%`;
                                return <line key={index} x1="0" y1={y} x2="100%" y2="50%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4"/>
                            })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`p-4 rounded-full bg-background border-2 ${providerBorders[provider]}`}>
                                <Server className={`h-8 w-8 ${providerColors[provider]}`}/>
                            </div>
                        </div>
                    </div>

                    {/* Regions Column */}
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-lg font-semibold text-muted-foreground">Connected Regions</h3>
                        <div className="flex flex-col gap-4">
                            {cloudRegions.filter(r => r.provider === provider).map(region => (
                                <div key={region.id} className="flex items-center gap-2 p-3 rounded-lg bg-card border">
                                    <Server className="h-5 w-5 text-primary" />
                                    <span className="font-medium">{region.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
