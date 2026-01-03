import { useAppStore } from '../stores/appStore';
import { AppView } from '../types';

export class AppManager {
  setCurrentView = (view: AppView) => {
    useAppStore.setState({ currentView: view });
  };

  setAiLoading = (loading: boolean) => {
    useAppStore.setState({ isAiLoading: loading });
  };

  setIsRecording = (recording: boolean) => {
    useAppStore.setState({ isRecording: recording });
  };

  setInputValue = (val: string) => {
    useAppStore.setState({ inputValue: val });
  };

  setAssistantInput = (val: string) => {
    useAppStore.setState({ assistantInput: val });
  };
}