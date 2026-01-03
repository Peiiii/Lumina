
import { useAppStore } from '../stores/appStore';
import { useAiStore } from '../stores/aiStore';
import { useFragmentsStore } from '../stores/fragmentsStore';
import { organizeFragments, generateReview, brainstormFromIdea, sendChatMessage } from '../services/geminiService';
import { AppView, AiMode } from '../types';

export class AiManager {
  setMode = (mode: AiMode) => {
    useAiStore.setState({ currentMode: mode });
  };

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

  sendChatMessage = async () => {
    const { assistantInput } = useAppStore.getState();
    const { chatHistory, currentMode } = useAiStore.getState();
    const { fragments } = useFragmentsStore.getState();
    if (!assistantInput.trim()) return;

    const userMessage = assistantInput;
    useAppStore.setState({ assistantInput: '' });
    
    useAiStore.setState({ 
      chatHistory: [...chatHistory, { role: 'user', content: userMessage }],
      isChatLoading: true
    });

    try {
      const streamResponse = await sendChatMessage(chatHistory, userMessage, fragments, currentMode);
      
      useAiStore.setState((state) => ({
        chatHistory: [...state.chatHistory, { role: 'model', content: "" }],
        isChatLoading: false
      }));

      let fullResponseText = "";

      for await (const chunk of streamResponse) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponseText += chunkText;
          
          useAiStore.setState((state) => {
            const newHistory = [...state.chatHistory];
            const lastMessageIndex = newHistory.length - 1;
            if (lastMessageIndex >= 0) {
              newHistory[lastMessageIndex] = {
                ...newHistory[lastMessageIndex],
                content: fullResponseText
              };
            }
            return { chatHistory: newHistory };
          });
        }
      }
    } catch (error) {
      console.error('Chat failed:', error);
      useAiStore.setState((state) => ({ 
        isChatLoading: false,
        chatHistory: [...state.chatHistory, { role: 'model', content: "抱歉，由于网络波动，我暂时无法回应。请稍后再试。" }] 
      }));
    } finally {
      useAiStore.setState({ isChatLoading: false });
    }
  };

  clearChat = () => {
    useAiStore.setState({ chatHistory: [], isChatLoading: false });
  };
}
