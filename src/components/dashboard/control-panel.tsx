'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { exchanges } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type ControlPanelProps = {
  filters: any;
  setFilters: (filters: any | ((prev: any) => any)) => void;
};

const providers = ['AWS', 'GCP', 'Azure'];

const legendItems = [
    { provider: 'AWS', color: '#FF9900' },
    { provider: 'GCP', color: '#4285F4' },
    { provider: 'Azure', color: '#0078D4' },
]

export default function ControlPanel({ filters, setFilters }: ControlPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleProviderChange = (provider: string, checked: boolean) => {
    setFilters((prev: any) => ({
      ...prev,
      providers: checked
        ? [...prev.providers, provider]
        : prev.providers.filter((p: string) => p !== provider),
    }));
  };
  
  const handleExchangeChange = (exchangeId: string, checked: boolean) => {
    setFilters((prev: any) => ({
        ...prev,
        exchanges: checked
          ? [...prev.exchanges, exchangeId]
          : prev.exchanges.filter((e: string) => e !== exchangeId),
      }));
  };

  const filteredExchanges = exchanges.filter(exchange => 
    exchange.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="font-semibold">Layers</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-connections">Show Latency Connections</Label>
          <Switch
            id="show-connections"
            checked={filters.showConnections}
            onCheckedChange={(checked: boolean) => setFilters({ ...filters, showConnections: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-regions">Show Cloud Regions</Label>
          <Switch
            id="show-regions"
            checked={filters.showRegions}
            onCheckedChange={(checked: boolean) => setFilters({ ...filters, showRegions: checked })}
          />
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="font-semibold">Legend</h3>
        <div className='space-y-2 text-sm text-muted-foreground'>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                <span>Exchange</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 border-2 border-muted-foreground" />
                <span>Cloud Region</span>
            </div>
            {legendItems.map(item => (
                <div key={item.provider} className="flex items-center gap-2">
                    <div className="h-3 w-3" style={{ backgroundColor: item.color }} />
                    <span>{item.provider}</span>
                </div>
            ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="font-semibold">Filters</h3>
        <div>
          <Label>Cloud Providers</Label>
          <div className="space-y-2 mt-2">
            {providers.map((provider) => (
              <div key={provider} className="flex items-center space-x-2">
                <Checkbox
                  id={`provider-${provider}`}
                  checked={filters.providers.includes(provider)}
                  onCheckedChange={(checked: boolean) => handleProviderChange(provider, !!checked)}
                />
                <Label htmlFor={`provider-${provider}`} className="font-normal">
                  {provider}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div>
            <Label>Exchanges</Label>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search exchanges..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {filteredExchanges.map((exchange) => (
                    <div key={exchange.id} className="flex items-center space-x-2">
                        <Checkbox
                        id={`exchange-${exchange.id}`}
                        checked={filters.exchanges.includes(exchange.id)}
                        onCheckedChange={(checked: boolean) => handleExchangeChange(exchange.id, !!checked)}
                        />
                        <Label htmlFor={`exchange-${exchange.id}`} className="font-normal">
                            {exchange.name}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
        <div>
          <Label>Max Latency (ms)</Label>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-muted-foreground w-8 text-center">{filters.latencyRange[0]}</span>
            <Slider
              value={[filters.latencyRange[1]]}
              onValueChange={(value: number[]) => setFilters({ ...filters, latencyRange: [0, value[0]] })}
              max={300}
              step={10}
            />
            <span className="text-sm text-muted-foreground w-8 text-center">{filters.latencyRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

