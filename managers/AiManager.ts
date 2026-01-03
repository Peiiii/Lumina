import { useAppStore } from '../stores/appStore';
import { useAiStore } from '../stores/aiStore';
import { useFragmentsStore } from '../stores/fragmentsStore';
import { organizeFragments, generateReview, brainstormFromIdea } from '../services/geminiService';
import { AppView } from '../types';

export class AiManager {
  triggerOrganize = async () => {
    const { fragments } = useFragmentsStore.getState();
    if (fragments.length === 0) return;

    useAppStore.setState({ isAiLoading: true });
    try {
      const result = await organizeFragments(fragments);
      useAiStore.setState({ planningData: result });
    } catch (error) {
      console.error('Organize failed:', error);
    } finally {
      useAppStore.setState({ isAiLoading: false });
    }
  };

  triggerReview = async () => {
    const { fragments } = useFragmentsStore.getState();
    if (fragments.length === 0) return;

    useAppStore.setState({ isAiLoading: true });
    try {
      const result = await generateReview(fragments);
      useAiStore.setState({ reviewData: result });
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      useAppStore.setState({ isAiLoading: false });
    }
  };

  handleBrainstorm = async (idea: string) => {
    useAppStore.setState({ isAiLoading: true, currentView: AppView.BRAINSTORM });
    try {
      const result = await brainstormFromIdea(idea);
      useAiStore.setState({ stormData: { idea, storm: result } });
    } catch (error) {
      console.error('Brainstorm failed:', error);
    } finally {
      useAppStore.setState({ isAiLoading: false });
    }
  };
}