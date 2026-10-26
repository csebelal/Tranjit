import { create } from 'zustand';
import { busService, metroService, type MetroStation } from '@/services/api';

interface StopWithAlias {
  bn: string;
  en: string | null;
  aliases: string[];
}

interface TransitState {
  stops: string[];
  stopsWithAliases: StopWithAlias[];
  metroStations: MetroStation[];
  isLoading: boolean;
  error: string | null;
  fetchStops: () => Promise<void>;
  fetchStopsWithAliases: () => Promise<void>;
  fetchMetroStations: () => Promise<void>;
}

export const useTransitStore = create<TransitState>((set) => ({
  stops: [],
  stopsWithAliases: [],
  metroStations: [],
  isLoading: false,
  error: null,
  fetchStops: async () => {
    set({ isLoading: true });
    try {
      const stops = await busService.getStops();
      set({ stops, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },
  fetchStopsWithAliases: async () => {
    set({ isLoading: true });
    try {
      const stopsWithAliases = await busService.getStopsWithAliases();
      set({ stopsWithAliases, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },
  fetchMetroStations: async () => {
    set({ isLoading: true });
    try {
      const metroStations = await metroService.getStations();
      set({ metroStations, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },
}));
