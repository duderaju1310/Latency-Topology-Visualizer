import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, Clock } from 'lucide-react';

type StatsCardsProps = {
  averageLatency: number;
  totalConnections: number;
};

export default function StatsCards({ averageLatency, totalConnections }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageLatency.toFixed(2)}ms</div>
          <p className="text-xs text-muted-foreground">Across all connections</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connections</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalConnections}</div>
          <p className="text-xs text-muted-foreground">Real-time links monitored</p>
        </CardContent>
      </Card>
    </div>
  );
}