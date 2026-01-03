import { create } from 'zustand';

interface AiState {
  planningData: any;
  reviewData: any;
  stormData: any;
}

export const useAiStore = create<AiState>(() => ({
  planningData: null,
  reviewData: null,
  stormData: null,
}));