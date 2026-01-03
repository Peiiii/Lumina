
import React from 'react';
import { AppView } from './types';
import { LuminaProvider } from './context/LuminaContext';
import { useAppStore } from './stores/appStore';
import { SparklesIcon } from './components/Icons';

// 导入重构后的布局组件
import { Sidebar } from './components/layout/Sidebar';
import { CanvasHeader } from './components/layout/CanvasHeader';
import { BottomInput } from './components/layout/BottomInput';
import { AssistantPanel } from './components/layout/AssistantPanel';

// 导入功能视图
import { FeedView } from './components/feed/FeedView';
import { PlanningView } from './components/planning/PlanningView';
import { ReviewView } from './components/review/ReviewView';
import { BrainstormView } from './components/brainstorm/BrainstormView';

const ViewRenderer: React.FC = () => {
  const { currentView, isAiLoading } = useAppStore();

  if (isAiLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center animate-bounce">
                <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -inset-2 bg-blue-400/20 blur-xl rounded-full animate-pulse" />
          </div>
          <p className="text-xs font-black text-slate-400 tracking-widest uppercase">AI 正在构建中...</p>
      </div>
    );
  }

  switch (currentView) {
    case AppView.FEED: return <FeedView />;
    case AppView.PLANNING: return <PlanningView />;
    case AppView.REVIEW: return <ReviewView />;
    case AppView.BRAINSTORM: return <BrainstormView />;
    default: return <FeedView />;
  }
};

const AppContent: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#F4F4F7] text-[#121212] overflow-hidden p-4 gap-4">
      {/* 1. 侧边栏导航 */}
      <Sidebar />

      {/* 2. 主画布区域 */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* 画布顶部状态栏 */}
        <CanvasHeader />

        {/* 内容容器 */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-12 pt-24 flex flex-col">
          <ViewRenderer />
        </div>

        {/* 底部悬浮录入 */}
        <BottomInput />
      </main>

      {/* 3. 右侧 AI 助手面板 */}
      <AssistantPanel />
    </div>
  );
};

const App: React.FC = () => (
  <LuminaProvider>
    <AppContent />
  </LuminaProvider>
);

export default App;
