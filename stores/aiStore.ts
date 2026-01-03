
import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface AiState {
  planningData: any;
  reviewData: any;
  stormData: any;
  chatHistory: ChatMessage[];
}

export const useAiStore = create<AiState>(() => ({
  planningData: null,
  reviewData: null,
  stormData: null,
  chatHistory: [],
}));
