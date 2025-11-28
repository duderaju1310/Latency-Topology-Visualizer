
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  BarChart2,
  AlertTriangle,
  SlidersHorizontal,
  Pause,
  Play,
  Sun,
  Moon,
  Download,
  Share2,
  Layers,
  Menu,
} from 'lucide-react';
import WorldMap from '@/components/dashboard/world-map';
import LatencyChart from '@/components/dashboard/latency-chart';
import LatencyAlerts from '@/components/dashboard/latency-alerts';
import StatsCards from '@/components/dashboard/stats-cards';
import TopologyView from '@/components/dashboard/topology-view';
import HeatmapView from '@/components/dashboard/heatmap-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ControlPanel from '@/components/dashboard/control-panel';
import type { LatencyData } from '@/lib/types';
import { Logo } from '@/components/icons';
import { exchanges, cloudRegions } from '@/lib/data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type View = 'map' | 'charts' | 'alerts' | 'topology' | 'heatmap';

// Helper to generate realistic random latency
const getRandomLatency = (isSameProvider: boolean) => {
  if (isSameProvider) {
    return 30 + Math.random() * 20;
  }
  return 50 + Math.random() * 200;
};


export default function Dashboard() {
  const [latencyData, setLatencyData] = useState<LatencyData[]>([]);
  const [isRotating, setIsRotating] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState<View>('map');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filters, setFilters] = useState({
    exchanges: [] as string[],
    providers: [] as string[],
    latencyRange: [0, 300],
    showConnections: true,
    showRegions: true,
  });

  useEffect(() => {
    const generateLatencyData = () => {
      const data: LatencyData[] = [];
      exchanges.forEach(exchange => {
        cloudRegions.forEach(region => {
          const isSameProvider = exchange.provider === region.provider;
          const latency = getRandomLatency(isSameProvider);
          data.push({ from: exchange.id, to: region.id, latency });
        });
      });
      setLatencyData(data);
    };

    generateLatencyData();
    const interval = setInterval(generateLatencyData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme]);

  const averageLatency = useMemo(() => {
    if (latencyData.length === 0) return 0;
    const total = latencyData.reduce((acc, curr) => acc + curr.latency, 0);
    return total / latencyData.length;
  }, [latencyData]);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const exportToCSV = () => {
    const allNodes = [...exchanges, ...cloudRegions];
    const nodeMap = new Map(allNodes.map(node => [node.id, node]));
    
    const headers = ['From', 'To', 'Latency (ms)'];
    const rows = latencyData.map(d => {
      const fromNode = nodeMap.get(d.from);
      const toNode = nodeMap.get(d.to);
      return [
        fromNode ? fromNode.name : d.from,
        toNode ? toNode.name : d.to,
        d.latency.toFixed(2),
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    link.setAttribute("download", `latency-report-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderNav = (isMobile = false) => (
    <nav className={`flex items-center gap-4 ${isMobile ? 'flex-col w-full' : 'flex-col'}`}>
      <TooltipProvider>
        <div className={isMobile ? 'w-full' : ''}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => { setActiveView('map'); isMobile && setMobileNavOpen(false); }} className={`flex items-center gap-4 ${isMobile ? 'w-full justify-start' : ''} ${activeView === 'map' ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <Globe className="h-6 w-6" />
                  <span className={isMobile ? '' : 'sr-only'}>Map</span>
                </Button>
              </TooltipTrigger>
              {!isMobile && <TooltipContent side="right"><p>Map</p></TooltipContent>}
            </Tooltip>
        </div>
        <div className={isMobile ? 'w-full' : ''}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => { setActiveView('topology'); isMobile && setMobileNavOpen(false); }} className={`flex items-center gap-4 ${isMobile ? 'w-full justify-start' : ''} ${activeView === 'topology' ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <Share2 className="h-6 w-6" />
                  <span className={isMobile ? '' : 'sr-only'}>Topology</span>
                </Button>
              </TooltipTrigger>
              {!isMobile && <TooltipContent side="right"><p>Topology</p></TooltipContent>}
            </Tooltip>
        </div>
        <div className={isMobile ? 'w-full' : ''}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => { setActiveView('heatmap'); isMobile && setMobileNavOpen(false); }} className={`flex items-center gap-4 ${isMobile ? 'w-full justify-start' : ''} ${activeView === 'heatmap' ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <Layers className="h-6 w-6" />
                  <span className={isMobile ? '' : 'sr-only'}>Heatmap</span>
                </Button>
              </TooltipTrigger>
              {!isMobile && <TooltipContent side="right"><p>Heatmap</p></TooltipContent>}
            </Tooltip>
        </div>
        <div className={isMobile ? 'w-full' : ''}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => { setActiveView('charts'); isMobile && setMobileNavOpen(false); }} className={`flex items-center gap-4 ${isMobile ? 'w-full justify-start' : ''} ${activeView === 'charts' ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <BarChart2 className="h-6 w-6" />
                  <span className={isMobile ? '' : 'sr-only'}>Charts</span>
                </Button>
              </TooltipTrigger>
              {!isMobile && <TooltipContent side="right"><p>Charts</p></TooltipContent>}
            </Tooltip>
        </div>
        <div className={isMobile ? 'w-full' : ''}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => { setActiveView('alerts'); isMobile && setMobileNavOpen(false); }} className={`flex items-center gap-4 ${isMobile ? 'w-full justify-start' : ''} ${activeView === 'alerts' ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                        <AlertTriangle className="h-6 w-6" />
                        <span className={isMobile ? '' : 'sr-only'}>Alerts</span>
                    </Button>
                </TooltipTrigger>
                {!isMobile && <TooltipContent side="right"><p>Alerts</p></TooltipContent>}
            </Tooltip>
        </div>
      </TooltipProvider>
    </nav>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'topology':
        return <TopologyView />;
      case 'heatmap':
        return <HeatmapView latencyData={latencyData} />;
      case 'charts':
        return (
          <div className="flex flex-col h-full gap-4">
            <h1 className="text-2xl font-bold text-foreground">Historical Latency</h1>
            <StatsCards averageLatency={averageLatency} totalConnections={latencyData.length} />
            <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader>
                    <CardTitle>Latency Trends</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <LatencyChart />
                </CardContent>
            </Card>
          </div>
        );
      case 'alerts':
        return (
            <div className="flex flex-col h-full gap-4">
                <h1 className="text-2xl font-bold text-foreground">AI Latency Analysis</h1>
                <p className="text-muted-foreground">
                    Analyze real-time and historical data to identify patterns, anomalies, and potential risks that could affect trading performance.
                </p>
                <Card className="flex-grow">
                    <CardHeader>
                        <CardTitle>Latency Anomaly Detection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LatencyAlerts latencyData={latencyData}/>
                    </CardContent>
                </Card>
            </div>
        );
      case 'map':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            <div className="lg:col-span-2 xl:col-span-3 h-full min-h-[50vh] relative">
              <header className="absolute top-4 left-4 z-10">
                 <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-xl font-bold">GeoQuantica</h1>
                    <p className="text-xs text-muted-foreground">Latency Topology Visualizer</p>
                  </div>
                </div>
              </header>
              <Card className="h-full w-full overflow-hidden">
                 <WorldMap latencyData={latencyData} filters={filters} isRotating={isRotating} />
              </Card>
              <div className="absolute bottom-4 left-4 z-10">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setIsRotating(!isRotating)}>
                            {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isRotating ? 'Pause Rotation' : 'Resume Rotation'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={toggleTheme} className="h-8 w-8">
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Toggle Theme</p></TooltipContent>
                      </Tooltip>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full max-w-sm sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>Controls</SheetTitle>
                          </SheetHeader>
                          <ControlPanel filters={filters} setFilters={setFilters} />
                        </SheetContent>
                      </Sheet>
                    </TooltipProvider>
                </div>
            </div>

            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <StatsCards averageLatency={averageLatency} totalConnections={latencyData.length} />
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle>AI Latency Analysis</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={exportToCSV} className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Export Latency Data (CSV)</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                  </CardHeader>
                  <CardContent>
                      <LatencyAlerts latencyData={latencyData} />
                  </CardContent>
              </Card>
              <Card className="flex-grow flex flex-col min-h-0">
                  <CardHeader>
                      <CardTitle>Historical Latency</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                      <LatencyChart />
                  </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="flex h-dvh w-full bg-background text-foreground flex-col md:flex-row">
      <aside className="hidden md:flex w-16 flex-col items-center space-y-4 border-r border-border bg-card p-2">
        <div className="p-2 text-primary">
          <Logo className="h-8 w-8" />
        </div>
        <div className="flex-1">
          {renderNav()}
        </div>
      </aside>

      <div className="flex md:hidden items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-lg font-bold">GeoQuantica</h1>
        </div>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-4">
            <SheetHeader>
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              {renderNav(true)}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 p-4 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
