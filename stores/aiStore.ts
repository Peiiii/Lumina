
import { create } from 'zustand';
import { AiMode } from '../types';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface AiState {
  currentMode: AiMode;
  planningData: any;
  reviewData: any;
  stormData: any;
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
}

export const useAiStore = create<AiState>(() => ({
  currentMode: AiMode.AGENT,
  planningData: null,
  reviewData: null,
  stormData: null,
  chatHistory: [],
  isChatLoading: false,
}));
