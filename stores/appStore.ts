import { create } from 'zustand';
import { AppView } from '../types';

interface AppState {
  currentView: AppView;
  isAiLoading: boolean;
  isRecording: boolean;
  inputValue: string;
  assistantInput: string;
}

export const useAppStore = create<AppState>(() => ({
  currentView: AppView.FEED,
  isAiLoading: false,
  isRecording: false,
  inputValue: '',
  assistantInput: '',
}));