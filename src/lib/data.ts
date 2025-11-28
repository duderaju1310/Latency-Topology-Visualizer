import type { Exchange, CloudRegion, LatencyData, HistoricalLatency } from '@/lib/types';

export const exchanges: Exchange[] = [
  { id: 'okx', name: 'OKX', location: { lat: 35.6895, lon: 139.6917, city: 'Tokyo', country: 'Japan', colo: 'NRT' }, provider: 'AWS' },
  { id: 'deribit', name: 'Deribit', location: { lat: 52.3702, lon: 4.8952, city: 'Amsterdam', country: 'Netherlands', colo: 'AMS' }, provider: 'GCP' },
  { id: 'bybit', name: 'Bybit', location: { lat: 1.3521, lon: 103.8198, city: 'Singapore', country: 'Singapore', colo: 'SIN' }, provider: 'AWS' },
  { id: 'binance', name: 'Binance', location: { lat: 34.0522, lon: -118.2437, city: 'Los Angeles', country: 'USA', colo: 'LAX' }, provider: 'Azure' },
  { id: 'coinbase', name: 'Coinbase', location: { lat: 51.5074, lon: -0.1278, city: 'London', country: 'UK', colo: 'LHR' }, provider: 'AWS' },
];

export const cloudRegions: CloudRegion[] = [
  // AWS
  { id: 'aws-us-east-1', name: 'US East (N. Virginia)', provider: 'AWS', location: { lat: 38.95, lon: -77.45, colo: 'IAD' }, serverCount: 15 },
  { id: 'aws-eu-west-1', name: 'EU (Ireland)', provider: 'AWS', location: { lat: 53.3498, lon: -6.2603, colo: 'DUB' }, serverCount: 12 },
  { id: 'aws-ap-northeast-1', name: 'Asia Pacific (Tokyo)', provider: 'AWS', location: { lat: 35.6895, lon: 139.6917, colo: 'NRT' }, serverCount: 18 },

  // GCP
  { id: 'gcp-us-central1', name: 'us-central1', provider: 'GCP', location: { lat: 41.2524, lon: -95.9980, colo: 'OMA' }, serverCount: 10 },
  { id: 'gcp-europe-west4', name: 'europe-west4', provider: 'GCP', location: { lat: 52.3702, lon: 4.8952, colo: 'AMS' }, serverCount: 8 },
  { id: 'gcp-asia-east2', name: 'asia-east2', provider: 'GCP', location: { lat: 22.3193, lon: 114.1694, colo: 'HKG' }, serverCount: 9 },

  // Azure
  { id: 'azure-eastus', name: 'East US', provider: 'Azure', location: { lat: 37.3712, lon: -79.8139, colo: 'IAD' }, serverCount: 14 },
  { id: 'azure-westeurope', name: 'West Europe', provider: 'Azure', location: { lat: 52.3702, lon: 4.8952, colo: 'AMS' }, serverCount: 11 },
  { id: 'azure-southeastasia', name: 'Southeast Asia', provider: 'Azure', location: { lat: 1.3521, lon: 103.8198, colo: 'SIN' }, serverCount: 13 },
];

export const getRealtimeLatency = (): LatencyData[] => {
  const data: LatencyData[] = [];
  exchanges.forEach(exchange => {
    // Connect to own provider regions
    cloudRegions.filter(r => r.provider === exchange.provider).forEach(region => {
      data.push({ from: exchange.id, to: region.id, latency: 10 + Math.random() * 40 });
    });
  });

  // Add a few logical cross-provider connections for visualization
  data.push({ from: 'okx', to: 'gcp-us-central1', latency: 130 + Math.random() * 20 }); // Tokyo -> US
  data.push({ from: 'deribit', to: 'aws-us-east-1', latency: 90 + Math.random() * 20 }); // Amsterdam -> US
  data.push({ from: 'coinbase', to: 'azure-southeastasia', latency: 200 + Math.random() * 20 }); // London -> Singapore

  return data;
};

// Generates more distinct data per pair
const hashCode = (s: string) => s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

export const getHistoricalLatency = (pair: string, hours: number): HistoricalLatency[] => {
  const data: HistoricalLatency[] = [];
  const now = new Date();
  
  const pairHash = Math.abs(hashCode(pair));
  const baseLatency = 20 + (pairHash % 200);
  const volatility = 10 + (pairHash % 20);

  let points: number;
  let intervalMinutes: number;

  if (hours <= 1) { // 1h
    points = 60; // every minute
    intervalMinutes = 1;
  } else if (hours <= 24) { // 24h
    points = 24; // every hour
    intervalMinutes = 60;
  } else if (hours <= 24 * 7) { // 7d
    points = 7 * 24; // every hour
    intervalMinutes = 60;
  } else { // 30d
    points = 30 * 24; // every hour
    intervalMinutes = 60;
  }
  
  if (hours > 24 * 7) { // For 30d, show daily average
      points = 30;
      intervalMinutes = 60 * 24;
  }


  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    
    const sineFactor = Math.sin((time.getUTCHours() / 24) * Math.PI * 2);
    const latency = baseLatency + (sineFactor * volatility) + ((Math.random() - 0.5) * volatility);
    
    data.push({
      time: time.toISOString(),
      latency: Math.max(10, latency),
    });
  }
  return data.reverse();
};
