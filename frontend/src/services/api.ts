import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Must have /api for Next.js proxy
  timeout: 15000,
  withCredentials: false,
});

// Log all requests
api.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message, error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);

export interface Bus {
  _id: string;
  name: string;
  nameEn: string;
  type: string;
  ac: boolean;
  time: string;
  stops: string[];
  dist?: number;
  fare?: number;
}

export interface RouteResponse {
  direct: Array<Bus & { routeStart: string; routeEnd: string }>;
  transfers: Array<{
    totalDist: number;
    totalFare: number;
    type: 'transfer';
    legs: Array<{ bus: string, from: string, to: string, dist: number, fare: number, routeStart: string, routeEnd: string }>;
  }>;
}

export interface MultimodalMetroInfo {
  idx: number;
  station: string;
  en: string;
}

export interface MultimodalBusOption {
  name: string;
  nameEn: string;
  type: string;
  ac: boolean;
  time: string;
  dist: number;
  fare: number;
  boardAt: string;
  alightAt: string;
}

export interface MultimodalStep {
  type: 'bus' | 'metro';
  bus?: string;
  from: string | number;
  to: string | number;
  fromName?: string;
  toName?: string;
  dist: number;
  fare: number;
  time?: number;
  midStations?: string[];
}

export interface MultimodalResponse {
  found: boolean;
  message?: string;
  sameStation?: boolean;
  from?: string;
  to?: string;
  fromMetro?: MultimodalMetroInfo;
  toMetro?: MultimodalMetroInfo;
  boardStation?: MultimodalMetroInfo;
  exitStation?: MultimodalMetroInfo;
  bus1Options: MultimodalBusOption[];
  bus2Options: MultimodalBusOption[];
  metroFare: number;
  metroTime: number;
  metroDist: number;
  midStations: Array<{ name: string; en: string }>;
  totalFare: number;
  totalTime: number;
  bus1Fare: number;
  bus2Fare: number;
  steps?: MultimodalStep[];
}

export interface MetroStation {
  _id: string;
  name: string;
  en: string;
  km: number;
  zone: number;
  major: boolean;
  terminal: boolean;
}

export const busService = {
  getAll: async () => (await api.get<Bus[]>('/buses')).data,
  search: async (from: string, to: string) => 
    (await api.get<RouteResponse>(`/buses/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)).data,
  getMultimodal: async (from: string, to: string) =>
    (await api.get<MultimodalResponse>(`/buses/multimodal?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)).data,
  getStops: async () => (await api.get<string[]>('/buses/stops')).data,
  getStopsWithAliases: async () => (await api.get<Array<{bn: string, en: string | null, aliases: string[]}>>('/buses/stops-with-aliases')).data,
};

export const metroService = {
  getStations: async () => (await api.get<MetroStation[]>('/metro/stations')).data,
  getFare: async (fromId: string, toId: string) => {
    const params = new URLSearchParams({ fromId, toId });
    return (await api.get<{fare: number; distance: string; time: number; from: string; to: string}>(
      `/metro/fare?${params.toString()}`
    )).data;
  },
};

export interface Fare {
  _id?: string;
  from: string;
  to: string;
  fare: number;
  route?: string;
  dist?: number;
  type?: string;
}

export const fareService = {
  search: async (q: string = '') => {
    const url = q ? `/fares?q=${encodeURIComponent(q)}` : '/fares';
    return (await api.get<Fare[]>(url)).data;
  }
};

export default api;


