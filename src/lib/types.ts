export type Exchange = {
  id: string;
  name: string;
  location: {
    lat: number;
    lon: number;
    city: string;
    country: string;
    colo?: string;
  };
  provider: 'AWS' | 'GCP' | 'Azure' | 'Other';
};

export type CloudRegion = {
  id: string;
  name: string;
  provider: 'AWS' | 'GCP' | 'Azure';
  location: {
    lat: number;
    lon: number;
    colo?: string;
  };
  serverCount: number;
};

export type LatencyData = {
  from: string; // Exchange or Region ID
  to: string; // Exchange or Region ID
  latency: number; // in ms
};

export type HistoricalLatency = {
  time: string; // ISO 8601 format
  latency: number;
};