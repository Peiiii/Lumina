
import React, { useState, useEffect } from 'react';
import { Fragment, AppView } from './types';
import { brainstormFromIdea, organizeFragments, generateReview } from './services/geminiService';
import { 
  PlusIcon, SparklesIcon, BrainIcon, ListIcon, CalendarIcon,
  AttachmentIcon, MentionIcon, SearchIcon, SendIcon, ShareIcon
} from './components/Icons';

const App: React.FC = () => {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.FEED);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  
  // AI Assistant State
  const [assistantInput, setAssistantInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lumina_fragments');
    if (saved) setFragments(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_fragments', JSON.stringify(fragments));
  }, [fragments]);

  const addFragment = () => {
    if (!inputValue.trim()) return;
    const newFragment: Fragment = {
      id: Date.now().toString(),
      content: inputValue,
      createdAt: Date.now(),
      tags: [],
      type: 'fragment'
    };
    setFragments(prev => [newFragment, ...prev]);
    setInputValue('');
  };

  const handleOrganize = async () => {
    if (fragments.length === 0) return;
    setIsAiLoading(true);
    try {
      const result = await organizeFragments(fragments);
      setAiResult(result);
      setCurrentView(AppView.PLANNING);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBrainstorm = async (idea: string) => {
    setIsAiLoading(true);
    try {
      const result = await brainstormFromIdea(idea);
      setAiResult(result);
      setCurrentView(AppView.BRAINSTORM);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleWeeklyReview = async () => {
    setIsAiLoading(true);
    try {
      const result = await generateReview(fragments);
      setAiResult({ summary: result });
      setCurrentView(AppView.REVIEW);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleTodo = (id: string) => {
    setFragments(prev => prev.map(f => 
      f.id === id ? { ...f, status: f.status === 'completed' ? 'pending' : 'completed' } : f
    ));
  };

  const deleteFragment = (id: string) => {
    setFragments(prev => prev.filter(f => f.id !== id));
  };

  const getViewTitle = () => {
    switch (currentView) {
      case AppView.FEED: return '碎片整理';
      case AppView.PLANNING: return '行动蓝图';
      case AppView.BRAINSTORM: return '创意涌现';
      case AppView.REVIEW: return '周期复盘';
      default: return '未命名项目';
    }
  };

  return (
    <div className="flex h-screen bg-[#FBFBFC] text-[#121212] overflow-hidden">
      {/* 极简左侧导航 */}
      <nav className="w-[76px] bg-white border-r border-[#F1F1F4] flex flex-col items-center py-12 z-20 flex-shrink-0">
        <div className="mb-16">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lovart-lg hover:scale-105 transition-lovart cursor-pointer">
             <SparklesIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <LovartSidebarBtn active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} icon={<ListIcon className="w-5 h-5" />} label="碎片记录" />
          <LovartSidebarBtn active={currentView === AppView.PLANNING} onClick={() => setCurrentView(AppView.PLANNING)} icon={<CalendarIcon className="w-5 h-5" />} label="行动计划" />
          <LovartSidebarBtn active={currentView === AppView.BRAINSTORM} onClick={() => setCurrentView(AppView.BRAINSTORM)} icon={<BrainIcon className="w-5 h-5" />} label="灵感风暴" />
          <LovartSidebarBtn active={currentView === AppView.REVIEW} onClick={() => setCurrentView(AppView.REVIEW)} icon={<SparklesIcon className="w-5 h-5" />} label="复盘洞察" />
        </div>

        <div className="mt-auto flex flex-col gap-6 items-center">
          <ToolBtn icon={<PlusIcon className="w-5 h-5" />} label="快速录入" />
          <div className="w-9 h-9 rounded-2xl bg-[#F4F4F7] border border-[#EEEEF1] flex items-center justify-center text-[11px] font-bold text-black hover:bg-slate-200 transition-lovart cursor-pointer">
            W
          </div>
        </div>
      </nav>

      {/* 主工作区 */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#FBFBFC]">
        <header className="h-[72px] flex items-center justify-between px-14 border-b border-[#F1F1F4]/80 bg-white/60 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-[15px] font-extrabold tracking-tight text-black flex items-center gap-3 cursor-pointer group">
              {getViewTitle()}
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-lovart" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
             <ToolBtn icon={<SearchIcon className="w-[18px] h-[18px]" />} label="全局搜索" />
             <ToolBtn icon={<ShareIcon className="w-[18px] h-[18px]" />} label="导出与分享" />
             <ToolBtn icon={<PlusIcon className="w-[18px] h-[18px]" />} label="添加视图" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-14 pt-16 pb-52">
          {currentView === AppView.FEED && (
            <div className="max-w-6xl mx-auto">
              {fragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-60 text-center opacity-40">
                  <SparklesIcon className="w-14 h-14 mb-6 text-black" />
                  <p className="text-[12px] font-black tracking-[0.3em] uppercase text-black">Compose your first thought</p>
                </div>
              ) : (
                <div className="masonry-grid">
                  {fragments.map(fragment => (
                    <FragmentCard 
                      key={fragment.id} 
                      fragment={fragment} 
                      onDelete={deleteFragment}
                      onToggleTodo={() => toggleTodo(fragment.id)}
                      onBrainstorm={() => handleBrainstorm(fragment.content)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === AppView.PLANNING && (
             <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-1000">
               {!aiResult ? (
                 <div className="text-center py-48 opacity-50">
                   <p className="text-[12px] font-black tracking-[0.4em] uppercase mb-10">Waiting for synthesis...</p>
                   <button onClick={handleOrganize} className="px-12 py-4 bg-black text-white rounded-full font-bold text-xs">重新生成计划</button>
                 </div>
               ) : (
                 <div className="grid gap-10">
                    <div className="p-16 bg-white rounded-[4rem] border border-[#F1F1F4] shadow-lovart-md">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">AI 综合建议</h3>
                      <p className="text-black text-[22px] font-semibold tracking-tight leading-relaxed">{aiResult.summary}</p>
                    </div>
                 </div>
               )}
             </div>
          )}

          {currentView === AppView.BRAINSTORM && (
             <div className="max-w-5xl mx-auto animate-in fade-in duration-1000">
                <div className="grid gap-8">
                  {aiResult && Array.isArray(aiResult) && aiResult.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-14 rounded-[4rem] border border-[#F1F1F4] shadow-sm">
                       <span className="inline-block px-4 py-1.5 bg-slate-50 text-[10px] font-black tracking-widest uppercase rounded-full mb-6">{item.complexity} Value</span>
                       <h3 className="text-2xl font-black mb-4">{item.concept}</h3>
                       <p className="text-slate-600 font-medium text-lg leading-relaxed">{item.reasoning}</p>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {currentView === AppView.REVIEW && (
             <div className="max-w-5xl mx-auto animate-in fade-in duration-1000">
                <div className="bg-white p-20 rounded-[6rem] border border-[#F1F1F4] shadow-lovart-lg">
                   <h2 className="text-3xl font-black mb-10">复盘深度报告</h2>
                   <div className="prose prose-slate max-w-none">
                      <p className="text-xl font-medium leading-loose text-slate-700">{aiResult?.summary}</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* 底部输入岛 */}
        {currentView === AppView.FEED && (
          <div className="absolute bottom-14 left-0 right-0 px-12 z-30 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-3xl p-3.5 pl-10 rounded-full shadow-lovart-lg flex items-center gap-8 border border-white/50">
                <div className="flex items-center gap-2 border-r border-[#F1F1F4] pr-8">
                   <ToolBtn icon={<AttachmentIcon className="w-5 h-5" />} label="插入媒体" />
                   <ToolBtn icon={<SparklesIcon className="w-5 h-5 text-blue-600" />} onClick={handleOrganize} label="一键聚合" />
                </div>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFragment()}
                  placeholder="记录此刻的灵感..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-bold text-black py-4 placeholder:text-[#A1A1AA] placeholder:font-medium"
                />
                <button 
                  onClick={addFragment}
                  disabled={!inputValue.trim()}
                  className="w-[52px] h-[52px] bg-black disabled:bg-[#F4F4F7] disabled:text-[#D4D4D8] text-white rounded-full flex items-center justify-center transition-lovart hover:bg-black/80 active:scale-90 shadow-lovart-md mr-1.5"
                >
                  <SendIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 右侧 AI 助手面板 - 对齐 Lovart 截图并适配笔记功能 */}
      <aside className="w-[380px] bg-white border-l border-[#F1F1F4] flex flex-col z-30 flex-shrink-0">
        {/* Header Icons Area */}
        <header className="h-[72px] flex items-center justify-end px-6 gap-3 flex-shrink-0">
           <ToolBtn icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} label="新思维" />
           <ToolBtn icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="历史对话" />
           <ToolBtn icon={<ShareIcon className="w-5 h-5" />} label="协作" />
           <ToolBtn icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="生成文档" />
           <ToolBtn icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>} label="全屏" />
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">
          <div className="mb-8 animate-in fade-in duration-500">
             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-6 shadow-lovart-md">
                <SparklesIcon className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-black text-black tracking-tight mb-2">Hi，我是你的思维助推器</h1>
             <p className="text-slate-400 font-bold text-lg leading-snug">让我们把散落的碎片，拼凑成宏大的蓝图吧！</p>
          </div>

          {/* 针对笔记产品的 Prompt Cards */}
          <div className="space-y-4 mb-8">
             <PromptCard 
               title="碎片聚合法" 
               subtitle="将散乱的记录转化为核心主题..." 
               onClick={handleOrganize}
               images={[
                 'https://images.unsplash.com/photo-1544411047-c491574abb22?w=100&h=150&fit=crop',
                 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=150&fit=crop'
               ]}
             />
             <PromptCard 
               title="深度风暴周报" 
               subtitle="基于本周 42 条碎片生成复盘..." 
               onClick={handleWeeklyReview}
               images={[
                 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=150&fit=crop',
                 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=150&fit=crop'
               ]}
             />
             <PromptCard 
               title="潜在待办识别" 
               subtitle="AI 识别文本中隐藏的任务节点..." 
               onClick={handleOrganize}
               images={[
                 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=100&h=150&fit=crop',
                 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=150&fit=crop'
               ]}
             />
          </div>

          <div className="flex items-center gap-2 mb-8 text-slate-400 hover:text-black cursor-pointer transition-lovart text-xs font-black uppercase tracking-[0.2em]">
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
             探索更多思维模板
          </div>

          {/* User Promotion Section */}
          <div className="bg-[#F0F7FF] p-5 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-[#E3EFFF] transition-lovart border border-[#E1EEFF]">
             <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                   <PlusIcon className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-black text-blue-700 tracking-tight leading-tight uppercase">
                   升级到 Pro 会员<br/>
                   <span className="opacity-60">解锁 Gemini 3 高精度模型</span>
                </div>
             </div>
             <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-lovart" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        </div>

        {/* AI Input Area */}
        <div className="p-6 border-t border-[#F1F1F4] bg-white flex-shrink-0">
          <div className="bg-[#FBFBFC] rounded-[2.5rem] p-5 border border-[#F1F1F4] focus-within:border-slate-300 focus-within:shadow-lovart-md transition-lovart group">
             <textarea 
               value={assistantInput}
               onChange={(e) => setAssistantInput(e.target.value)}
               placeholder="描述你想如何整理你的想法..."
               className="w-full bg-transparent border-none focus:outline-none resize-none h-24 text-[15px] font-semibold text-black placeholder:text-slate-400 leading-relaxed mb-4 scrollbar-hide"
             />
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <AssistantSmallBtn icon={<AttachmentIcon className="w-4 h-4" />} />
                   <AssistantSmallBtn icon={<MentionIcon className="w-4 h-4" />} />
                   <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-lovart">
                      <SparklesIcon className="w-4 h-4" />
                   </div>
                </div>
                <div className="flex items-center gap-1.5">
                   <AssistantSmallBtn icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>} />
                   <AssistantSmallBtn icon={<BrainIcon className="w-4 h-4" />} />
                   <AssistantSmallBtn icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>} />
                   <button 
                     disabled={!assistantInput.trim()}
                     className={`w-9 h-9 rounded-full flex items-center justify-center transition-lovart ml-2 shadow-sm ${assistantInput.trim() ? 'bg-black text-white hover:bg-slate-800' : 'bg-[#F1F1F4] text-slate-300'}`}
                   >
                     <SendIcon className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// --- 辅助组件 ---

const AssistantSmallBtn = ({ icon }: { icon: React.ReactNode }) => (
  <button className="w-8 h-8 text-slate-500 hover:bg-slate-100 hover:text-black rounded-xl flex items-center justify-center transition-lovart">
    {icon}
  </button>
);

const PromptCard = ({ title, subtitle, images, onClick }: { title: string, subtitle: string, images: string[], onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-[#F8F9FA] p-5 pr-2 rounded-[2.2rem] flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-lovart-md border border-transparent hover:border-slate-100 transition-lovart overflow-hidden"
  >
    <div className="flex-1 pr-4">
      <h4 className="text-[15px] font-black text-black mb-1 group-hover:text-blue-600 transition-lovart">{title}</h4>
      <p className="text-slate-400 text-[11px] font-bold leading-tight line-clamp-1">{subtitle}</p>
    </div>
    <div className="flex -space-x-4 relative pr-3">
      {images.map((url, i) => (
        <div 
          key={i} 
          className={`w-12 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lovart-sm transition-lovart transform origin-bottom ${i === 0 ? 'rotate-[12deg] group-hover:rotate-0' : 'rotate-[-8deg] group-hover:rotate-0 scale-95'}`} 
          style={{zIndex: images.length - i}}
        >
          <img src={url} alt="card" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
);

const ToolBtn = ({ icon, onClick, label }: { icon: React.ReactNode, onClick?: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className="p-3 text-black hover:bg-[#F1F1F4]/80 rounded-[1.2rem] transition-lovart active:scale-95 group relative flex items-center justify-center"
  >
    {React.cloneElement(icon as React.ReactElement, { 
      className: `${(icon as any).props.className || 'w-5 h-5'} transition-lovart group-hover:scale-105` 
    })}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3.5 py-2 bg-[#121212] text-white text-[11px] font-black rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-lovart -translate-y-3 group-hover:translate-y-0 z-50 whitespace-nowrap shadow-lovart-lg">
      {label}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#121212] rotate-45 rounded-sm" />
    </div>
  </button>
);

const LovartSidebarBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-[52px] h-[52px] rounded-[1.5rem] flex items-center justify-center transition-lovart relative group ${active ? 'bg-[#F1F1F4] text-black' : 'text-black hover:bg-[#F1F1F4]/40'}`}
  >
    {icon}
    {active && (
      <div className="absolute -left-6 w-1.5 h-1.5 bg-black rounded-full shadow-[0_0_12px_rgba(0,0,0,0.4)]" />
    )}
    <div className="absolute left-[76px] px-5 py-3 bg-[#121212] text-white text-[11px] font-black rounded-[1.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-lovart -translate-x-4 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-lovart-lg">
      {label}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#121212] rotate-45 rounded-sm -z-10" />
    </div>
  </button>
);

const FragmentCard: React.FC<{ fragment: any, onDelete: any, onToggleTodo: any, onBrainstorm: any }> = ({ fragment, onDelete, onToggleTodo, onBrainstorm }) => {
  const isTodo = fragment.content.toLowerCase().startsWith('todo:') || fragment.type === 'todo';
  const cleanContent = fragment.content.replace(/^todo:\s*/i, '');

  return (
    <div className="bg-white p-12 rounded-[5rem] border border-[#F1F1F4] shadow-lovart-sm hover:shadow-lovart-lg transition-lovart group relative">
      <div className="flex gap-8">
        {isTodo && (
          <button 
            onClick={onToggleTodo}
            className={`w-8 h-8 mt-2 rounded-full border-[2.5px] flex-shrink-0 flex items-center justify-center transition-lovart ${fragment.status === 'completed' ? 'bg-black border-black shadow-lovart-md' : 'border-[#E4E4E7] hover:border-black'}`}
          >
            {fragment.status === 'completed' && <PlusIcon className="w-4 h-4 text-white rotate-45 stroke-[3]" />}
          </button>
        )}
        <div className="flex-1">
          <p className={`text-black leading-relaxed font-bold text-[1.25rem] tracking-tight transition-lovart ${fragment.status === 'completed' ? 'opacity-20 line-through' : ''}`}>
            {cleanContent}
          </p>
          <div className="mt-12 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-lovart translate-y-4 group-hover:translate-y-0">
            <div className="flex items-center gap-5">
               <span className="text-[11px] font-black tracking-[0.25em] text-slate-400 uppercase">
                 {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
            <div className="flex items-center gap-1">
              <ToolBtn icon={<BrainIcon className="w-4 h-4" />} onClick={() => onBrainstorm(fragment.content)} label="思维发散" />
              <ToolBtn icon={<PlusIcon className="w-4 h-4 rotate-45 text-black" />} onClick={() => onDelete(fragment.id)} label="移除节点" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
