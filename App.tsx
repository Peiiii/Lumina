
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
      <nav className="w-[76px] bg-white border-r border-[#F1F1F4] flex flex-col items-center py-10 z-20 flex-shrink-0">
        <div className="mb-14">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lovart-lg hover:scale-105 transition-lovart cursor-pointer">
             <SparklesIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5">
          <LovartSidebarBtn active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} icon={<ListIcon className="w-5 h-5" />} label="碎片记录" />
          <LovartSidebarBtn active={currentView === AppView.PLANNING} onClick={() => setCurrentView(AppView.PLANNING)} icon={<CalendarIcon className="w-5 h-5" />} label="行动计划" />
          <LovartSidebarBtn active={currentView === AppView.BRAINSTORM} onClick={() => setCurrentView(AppView.BRAINSTORM)} icon={<BrainIcon className="w-5 h-5" />} label="灵感风暴" />
          <LovartSidebarBtn active={currentView === AppView.REVIEW} onClick={() => setCurrentView(AppView.REVIEW)} icon={<SparklesIcon className="w-5 h-5" />} label="复盘洞察" />
        </div>

        <div className="mt-auto flex flex-col gap-6 items-center">
          <ToolBtn icon={<PlusIcon className="w-5 h-5" />} label="快速录入" tooltipPosition="right" />
          <div className="w-9 h-9 rounded-2xl bg-[#F4F4F7] border border-[#EEEEF1] flex items-center justify-center text-[11px] font-bold text-black hover:bg-slate-200 transition-lovart cursor-pointer">
            W
          </div>
        </div>
      </nav>

      {/* 主工作区 */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#FBFBFC]">
        <header className="h-[72px] flex items-center justify-between px-10 border-b border-[#F1F1F4]/80 bg-white/60 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-[14px] font-extrabold tracking-tight text-black flex items-center gap-2 cursor-pointer group">
              {getViewTitle()}
              <svg className="w-3 h-3 text-slate-400 group-hover:text-black transition-lovart" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </h2>
          </div>
          
          <div className="flex items-center gap-1">
             <ToolBtn icon={<SearchIcon className="w-[18px] h-[18px]" />} label="全局搜索" tooltipPosition="bottom" />
             <ToolBtn icon={<ShareIcon className="w-[18px] h-[18px]" />} label="导出与分享" tooltipPosition="bottom" />
             <ToolBtn icon={<PlusIcon className="w-[18px] h-[18px]" />} label="添加视图" tooltipPosition="bottom" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-10 pt-12 pb-48">
          {currentView === AppView.FEED && (
            <div className="max-w-5xl mx-auto">
              {fragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-48 text-center opacity-30">
                  <SparklesIcon className="w-12 h-12 mb-5 text-black" />
                  <p className="text-[11px] font-black tracking-[0.2em] uppercase text-black">Awaiting fragments</p>
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
          {/* 其他视图保持逻辑... */}
        </div>

        {/* 底部输入岛 */}
        {currentView === AppView.FEED && (
          <div className="absolute bottom-10 left-0 right-0 px-10 z-30 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-2xl p-2.5 pl-8 rounded-full shadow-lovart-lg flex items-center gap-6 border border-white">
                <div className="flex items-center gap-1 border-r border-[#F1F1F4] pr-6">
                   <ToolBtn icon={<AttachmentIcon className="w-5 h-5" />} label="媒体" tooltipPosition="top" />
                   <ToolBtn icon={<SparklesIcon className="w-5 h-5 text-blue-600" />} onClick={handleOrganize} label="AI 整理" tooltipPosition="top" />
                </div>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFragment()}
                  placeholder="记录此刻灵感..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-black py-4 placeholder:text-slate-300 placeholder:font-medium"
                />
                <button 
                  onClick={addFragment}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 bg-black disabled:bg-[#F4F4F7] disabled:text-[#D4D4D8] text-white rounded-full flex items-center justify-center transition-lovart hover:bg-black/80 active:scale-90 shadow-lovart-md mr-1"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 右侧 AI 助手面板 - 深度适配并防止提示超出 */}
      <aside className="w-[360px] bg-white border-l border-[#F1F1F4] flex flex-col z-30 flex-shrink-0">
        <header className="h-[72px] flex items-center justify-end px-5 gap-1 flex-shrink-0 border-b border-[#FBFBFC]">
           <ToolBtn icon={<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} label="新思维" tooltipPosition="bottom" />
           <ToolBtn icon={<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="历史" tooltipPosition="bottom" />
           <ToolBtn icon={<ShareIcon className="w-[18px] h-[18px]" />} label="协作" tooltipPosition="bottom" />
           <ToolBtn icon={<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="生成" tooltipPosition="bottom" />
           <ToolBtn icon={<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>} label="全屏" tooltipPosition="left" />
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-7 py-8">
          <div className="mb-10">
             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-6 shadow-lovart-md">
                <SparklesIcon className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-black text-black tracking-tight mb-2">Hi，我是你的思维助推器</h1>
             <p className="text-slate-400 font-bold text-lg leading-snug opacity-80">让散落的碎片，拼成宏大的蓝图。</p>
          </div>

          <div className="space-y-4 mb-8">
             <PromptCard 
               title="碎片聚合法" 
               subtitle="深度解析 30 条零碎记录..." 
               onClick={handleOrganize}
               images={['https://images.unsplash.com/photo-1544411047-c491574abb22?w=100&h=150&fit=crop', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=150&fit=crop']}
             />
             <PromptCard 
               title="深度风暴周报" 
               subtitle="本周创意转化率分析..." 
               onClick={handleWeeklyReview}
               images={['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=150&fit=crop', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=150&fit=crop']}
             />
          </div>

          <div className="flex items-center gap-2 mb-8 text-slate-400 hover:text-black cursor-pointer transition-lovart text-[10px] font-black uppercase tracking-[0.2em] group">
             <svg className="w-4 h-4 transition-lovart group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             切换思维模板
          </div>

          <div className="bg-[#F0F7FF] p-4 pr-3 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#E3EFFF] transition-lovart border border-[#E1EEFF] mb-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                   <PlusIcon className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-black text-blue-700 tracking-tight leading-tight uppercase">
                   升级 Pro 会员<br/><span className="opacity-50">解锁无限 AI 整理次数</span>
                </div>
             </div>
             <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        </div>

        {/* AI 输入区 - 精确适配提示位置 */}
        <div className="p-6 border-t border-[#F1F1F4] bg-white flex-shrink-0">
          <div className="bg-[#FBFBFC] rounded-3xl p-4 border border-[#F1F1F4] focus-within:border-slate-200 transition-lovart">
             <textarea 
               value={assistantInput}
               onChange={(e) => setAssistantInput(e.target.value)}
               placeholder="描述你想如何整理想法..."
               className="w-full bg-transparent border-none focus:outline-none resize-none h-20 text-[14px] font-semibold text-black placeholder:text-slate-300 leading-relaxed mb-3"
             />
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                   <AssistantSmallBtn icon={<AttachmentIcon className="w-4 h-4" />} label="附件" />
                   <AssistantSmallBtn icon={<MentionIcon className="w-4 h-4" />} label="提及" />
                   <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-lovart">
                      <SparklesIcon className="w-4 h-4" />
                   </div>
                </div>
                <div className="flex items-center gap-1">
                   <AssistantSmallBtn icon={<BrainIcon className="w-4 h-4" />} label="思维" />
                   <AssistantSmallBtn icon={<SearchIcon className="w-4 h-4" />} label="联想" />
                   <button 
                     disabled={!assistantInput.trim()}
                     className={`w-8 h-8 rounded-full flex items-center justify-center transition-lovart ml-2 ${assistantInput.trim() ? 'bg-black text-white' : 'bg-[#F1F1F4] text-slate-300'}`}
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

// --- 精确复刻 Lovart 风格的辅助组件 ---

type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

const ToolBtn = ({ icon, onClick, label, tooltipPosition = 'top' }: { icon: React.ReactNode, onClick?: () => void, label: string, tooltipPosition?: TooltipPos }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3 -translate-y-2 group-hover:translate-y-0',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3 translate-y-2 group-hover:translate-y-0',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3 -translate-x-2 group-hover:translate-x-0',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3 translate-x-2 group-hover:translate-x-0'
  };

  const arrowClasses = {
    top: '-bottom-1 left-1/2 -translate-x-1/2',
    bottom: '-top-1 left-1/2 -translate-x-1/2',
    left: '-right-1 top-1/2 -translate-y-1/2',
    right: '-left-1 top-1/2 -translate-y-1/2'
  };

  return (
    <button 
      onClick={onClick}
      className="p-2.5 text-black hover:bg-slate-100/80 rounded-xl transition-lovart active:scale-95 group relative flex items-center justify-center"
    >
      {React.cloneElement(icon as React.ReactElement, { className: `${(icon as any).props.className} transition-lovart group-hover:scale-110` })}
      
      <div className={`absolute px-3 py-1.5 bg-[#121212] text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-lovart z-50 whitespace-nowrap shadow-lovart-lg ${positionClasses[tooltipPosition]}`}>
        {label}
        <div className={`absolute w-2 h-2 bg-[#121212] rotate-45 rounded-sm ${arrowClasses[tooltipPosition]}`} />
      </div>
    </button>
  );
};

const AssistantSmallBtn = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="relative group">
    <button className="w-7 h-7 text-slate-400 hover:bg-slate-100 hover:text-black rounded-lg flex items-center justify-center transition-lovart">
      {icon}
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 bg-[#121212] text-white text-[9px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-lovart pointer-events-none z-50 whitespace-nowrap">
      {label}
    </div>
  </div>
);

const LovartSidebarBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-lovart relative group ${active ? 'bg-slate-100 text-black shadow-sm' : 'text-black hover:bg-slate-50'}`}
  >
    {icon}
    {active && (
      <div className="absolute -left-6 w-1 h-1 bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse" />
    )}
    <div className="absolute left-[56px] px-3.5 py-2 bg-[#121212] text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-lovart -translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-lovart-lg">
      {label}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#121212] rotate-45 rounded-sm" />
    </div>
  </button>
);

const PromptCard = ({ title, subtitle, images, onClick }: { title: string, subtitle: string, images: string[], onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-[#F8F9FA] p-5 pr-2 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-lovart-md border border-transparent hover:border-slate-100 transition-lovart overflow-hidden"
  >
    <div className="flex-1 pr-3">
      <h4 className="text-[14px] font-black text-black mb-1 group-hover:text-blue-600 transition-lovart">{title}</h4>
      <p className="text-slate-400 text-[10px] font-bold leading-tight line-clamp-1">{subtitle}</p>
    </div>
    <div className="flex -space-x-4 relative pr-2">
      {images.map((url, i) => (
        <div key={i} className={`w-11 h-15 rounded-lg overflow-hidden border-2 border-white shadow-lovart-sm transition-lovart transform origin-bottom ${i === 0 ? 'rotate-[12deg] group-hover:rotate-0' : 'rotate-[-8deg] group-hover:rotate-0 scale-95'}`} style={{zIndex: images.length - i}}>
          <img src={url} alt="card" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
);

const FragmentCard: React.FC<{ fragment: any, onDelete: any, onToggleTodo: any, onBrainstorm: any }> = ({ fragment, onDelete, onToggleTodo, onBrainstorm }) => {
  const isTodo = fragment.content.toLowerCase().startsWith('todo:') || fragment.type === 'todo';
  const cleanContent = fragment.content.replace(/^todo:\s*/i, '');

  return (
    <div className="bg-white p-10 rounded-[4rem] border border-[#F1F1F4] shadow-lovart-sm hover:shadow-lovart-lg transition-lovart group relative">
      <div className="flex gap-7">
        {isTodo && (
          <button 
            onClick={onToggleTodo}
            className={`w-7 h-7 mt-1.5 rounded-full border-[2px] flex-shrink-0 flex items-center justify-center transition-lovart ${fragment.status === 'completed' ? 'bg-black border-black' : 'border-[#E4E4E7] hover:border-black'}`}
          >
            {fragment.status === 'completed' && <PlusIcon className="w-4 h-4 text-white rotate-45 stroke-[2]" />}
          </button>
        )}
        <div className="flex-1">
          <p className={`text-black leading-relaxed font-bold text-[1.15rem] tracking-tight transition-lovart ${fragment.status === 'completed' ? 'opacity-20 line-through' : ''}`}>
            {cleanContent}
          </p>
          <div className="mt-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-lovart translate-y-3 group-hover:translate-y-0">
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase">
              {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-1">
              <ToolBtn icon={<BrainIcon className="w-4 h-4" />} onClick={() => onBrainstorm(fragment.content)} label="思维发散" tooltipPosition="top" />
              <ToolBtn icon={<PlusIcon className="w-4 h-4 rotate-45 text-black" />} onClick={() => onDelete(fragment.id)} label="清理节点" tooltipPosition="top" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
