
import React from 'react';
import { AppView } from './types';
import { LuminaProvider, usePresenter } from './context/LuminaContext';
import { useAppStore } from './stores/appStore';
import { useAiStore } from './stores/aiStore';
import { 
  SparklesIcon, BrainIcon, ListIcon, CalendarIcon,
  SearchIcon, SendIcon, ShareIcon
} from './components/Icons';
import { IconButton, PromptCard } from './components/UI';
import { FeedView, PlanningView, ReviewView, BrainstormView } from './components/Business';

const AppContent: React.FC = () => {
  const presenter = usePresenter();
  const { currentView, isAiLoading, isRecording, inputValue, assistantInput } = useAppStore();
  const { planningData, reviewData, stormData } = useAiStore();

  const renderView = () => {
    if (isAiLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center animate-bounce">
                  <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-2 bg-blue-400/20 blur-xl rounded-full animate-pulse" />
            </div>
            <p className="text-xs font-black text-slate-400 tracking-widest uppercase">AI Architecting...</p>
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

  return (
    <div className="flex h-screen bg-[#F4F4F7] text-[#121212] overflow-hidden p-4 gap-4">
      {/* 侧边栏 */}
      <nav className="w-[58px] bg-white rounded-[24px] shadow-lovart-md border border-white flex flex-col items-center py-5 z-20 flex-shrink-0 self-center h-fit">
        <div className="flex flex-col gap-2.5">
          <IconButton size="md" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21l-9-9 9-9 9 9-9 9z" /></svg>} label="灵感流" active={currentView === AppView.FEED} onClick={() => presenter.app.setCurrentView(AppView.FEED)} tooltipPos="right" />
          <IconButton size="md" icon={<ListIcon />} label="规划/待办" active={currentView === AppView.PLANNING} onClick={() => presenter.app.setCurrentView(AppView.PLANNING)} tooltipPos="right" />
          <IconButton size="md" icon={<BrainIcon />} label="创意工坊" active={currentView === AppView.BRAINSTORM} onClick={() => presenter.app.setCurrentView(AppView.BRAINSTORM)} tooltipPos="right" />
          <IconButton size="md" icon={<CalendarIcon />} label="深度复盘" active={currentView === AppView.REVIEW} onClick={() => presenter.app.setCurrentView(AppView.REVIEW)} tooltipPos="right" />
          <div className="w-6 h-[1px] bg-slate-50 my-1 self-center" />
          <IconButton size="md" icon={<ShareIcon />} label="导出" tooltipPos="right" />
        </div>
      </nav>

      {/* 主画布 */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <header className="absolute top-4 left-0 right-0 flex justify-between items-center pointer-events-none z-20 px-4">
          <div className="bg-white/95 backdrop-blur-xl px-2.5 py-1 rounded-[14px] shadow-lovart-sm border border-white/50 pointer-events-auto flex items-center gap-2.5">
             <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white font-black text-[8px]">LU</div>
             <div className="flex items-center gap-1 cursor-pointer group">
                <span className="text-[12px] font-bold text-slate-800 tracking-tight">
                    {currentView === AppView.FEED ? '无限灵感画布' : 
                     currentView === AppView.PLANNING ? '个人规划象限' : 
                     currentView === AppView.REVIEW ? '复盘·Weekly Review' : '创意风暴中心'}
                </span>
                <svg className="w-2 h-2 text-slate-300 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>
          <div className="bg-white/95 backdrop-blur-xl px-3 py-1 rounded-[14px] shadow-lovart-sm border border-white/50 pointer-events-auto flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">Syncing...</span>
             <IconButton size="sm" icon={<SearchIcon />} label="检索" tooltipPos="bottom" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-12 pt-24 flex flex-col">
          {renderView()}
        </div>

        {/* 底部悬浮录入 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-none">
          <div className={`bg-white/95 backdrop-blur-2xl p-2.5 pl-7 rounded-full shadow-lovart-lg flex items-center gap-4 border border-white pointer-events-auto transition-all ${isRecording ? 'ring-4 ring-red-400/20' : ''}`}>
            {isRecording ? (
              <div className="flex-1 flex items-center gap-2">
                 <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-1 bg-red-400 rounded-full animate-wave" style={{height: `${10 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s`}} />
                    ))}
                 </div>
                 <span className="text-xs font-black text-red-500 tracking-widest uppercase ml-2">Recording Voice...</span>
              </div>
            ) : (
              <input 
                value={inputValue}
                onChange={(e) => presenter.app.setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && presenter.fragments.addFragment()}
                placeholder="捕捉灵光一闪，或点击麦克风说出想法..."
                className="flex-1 bg-transparent border-none focus:outline-none text-[14px] font-bold text-black py-2 placeholder:text-slate-300"
              />
            )}
            <div className="flex items-center gap-1">
              <IconButton 
                icon={isRecording ? <div className="w-2 h-2 bg-white rounded-sm" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><path d="M12 19v4m-4 0h8"/></svg>} 
                label={isRecording ? "停止录音" : "语音捕捉"} 
                variant={isRecording ? "solid" : "ghost"}
                className={isRecording ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                size="md" 
                onClick={presenter.fragments.simulateRecording}
              />
              <IconButton icon={<SendIcon />} label="提交记录" variant="solid" size="md" onClick={() => presenter.fragments.addFragment()} />
            </div>
          </div>
        </div>
      </main>

      {/* 右侧面板 */}
      <aside className="w-[340px] bg-white rounded-[28px] shadow-lovart-md border border-white flex flex-col z-30 flex-shrink-0 overflow-hidden">
        <header className="h-[60px] flex items-center justify-end px-4 gap-0.5 flex-shrink-0 border-b border-slate-50/50">
           <IconButton icon={<ListIcon />} label="历史记录" size="sm" tooltipPos="bottom" />
           <IconButton icon={<ShareIcon />} label="协同" size="sm" tooltipPos="bottom" />
           <IconButton icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>} label="时间线" size="sm" tooltipPos="left" />
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6">
          <div className="mb-8">
             <div className="inline-flex items-center gap-2 px-2 py-1 bg-black text-white rounded-full mb-4">
                <SparklesIcon className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Active Assistant</span>
             </div>
             <h1 className="text-[20px] font-black text-black tracking-tight mb-1 leading-tight">AI 智能管家</h1>
             <p className="text-slate-400 font-bold text-sm tracking-tight leading-snug">手动触发深度整理，将零碎想法升华为结构性洞察。</p>
          </div>

          <div className="space-y-4 mb-8">
             <PromptCard 
               title="AI 自动化规划" 
               subtitle="分析全域碎片记录，一键生成任务象限看板。" 
               onClick={() => {
                   presenter.app.setCurrentView(AppView.PLANNING);
                   if (!planningData) presenter.ai.triggerOrganize();
               }}
               images={[
                 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=120&h=180&fit=crop',
                 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=120&h=180&fit=crop'
               ]}
             />
             <PromptCard 
               title="生成深度周报" 
               subtitle="深度回顾过去思维轨迹，提炼成长亮点与建议。" 
               onClick={() => {
                    presenter.app.setCurrentView(AppView.REVIEW);
                    if (!reviewData) presenter.ai.triggerReview();
               }}
               images={[
                 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?w=120&h=180&fit=crop',
                 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=120&h=180&fit=crop'
               ]}
             />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-white mb-8">
             <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">今日活跃度</span>
                <span className="text-[9px] font-black text-black">86%</span>
             </div>
             <div className="h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-black w-[86%] rounded-full" />
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-50 flex-shrink-0">
          <div className="bg-[#FBFBFC] rounded-[22px] p-4 border border-slate-100 transition-all focus-within:shadow-md focus-within:border-slate-200">
             <textarea 
               value={assistantInput}
               onChange={(e) => presenter.app.setAssistantInput(e.target.value)}
               placeholder="对话 AI，整理你的混乱思绪..."
               className="w-full bg-transparent border-none focus:outline-none resize-none h-16 text-[13px] font-semibold text-black placeholder:text-slate-300 leading-snug mb-2 scrollbar-hide"
             />
             <div className="flex items-center justify-between">
                <IconButton icon={<SparklesIcon />} label="灵感激发" size="sm" variant="tint" tooltipPos="top" />
                <button 
                  disabled={!assistantInput.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${assistantInput.trim() ? 'bg-black text-white hover:scale-105' : 'bg-[#F1F1F4] text-slate-300'}`}
                >
                  <svg className="w-4 h-4 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19l7-7-7-7M5 12h14" /></svg>
                </button>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

const App: React.FC = () => (
  <LuminaProvider>
    <AppContent />
  </LuminaProvider>
);

export default App;
