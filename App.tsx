
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
      case AppView.FEED: return '碎片化记录';
      case AppView.PLANNING: return '个人规划';
      case AppView.BRAINSTORM: return '头脑风暴';
      case AppView.REVIEW: return '复盘洞察';
      default: return '未命名';
    }
  };

  return (
    <div className="flex h-screen bg-[#FBFBFC] text-[#121212]">
      {/* Lovart 极简侧边导航栏 */}
      <nav className="w-[72px] bg-white border-r border-slate-100 flex flex-col items-center py-8 z-20">
        <div className="mb-12">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg shadow-black/10 hover:scale-105 transition-all cursor-pointer">
             <SparklesIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <LovartSidebarBtn active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} icon={<ListIcon className="w-5 h-5" />} label="碎片记录" />
          <LovartSidebarBtn active={currentView === AppView.PLANNING} onClick={() => setCurrentView(AppView.PLANNING)} icon={<CalendarIcon className="w-5 h-5" />} label="个人规划" />
          <LovartSidebarBtn active={currentView === AppView.BRAINSTORM} onClick={() => setCurrentView(AppView.BRAINSTORM)} icon={<BrainIcon className="w-5 h-5" />} label="头脑风暴" />
          <LovartSidebarBtn active={currentView === AppView.REVIEW} onClick={() => setCurrentView(AppView.REVIEW)} icon={<SparklesIcon className="w-5 h-5" />} label="复盘洞察" />
        </div>

        <div className="mt-auto flex flex-col gap-5">
          <ToolBtn icon={<PlusIcon className="w-5 h-5" />} onClick={() => {}} />
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-black hover:bg-slate-200 transition-colors cursor-pointer" title="用户设置">
            W
          </div>
        </div>
      </nav>

      {/* 主工作区 */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header - 精确对齐 Lovart 顶栏 */}
        <header className="h-[64px] flex items-center justify-between px-10 border-b border-slate-100/60 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold tracking-tight text-black flex items-center gap-1.5 cursor-default group">
              {getViewTitle()}
              <svg className="w-3 h-3 text-slate-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
             {isAiLoading && (
               <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-600 text-[10px] font-bold animate-pulse border border-blue-100 mr-2">
                 Thinking...
               </div>
             )}
             <ToolBtn icon={<PlusIcon className="w-4 h-4" />} onClick={() => {}} />
             <ToolBtn icon={<SearchIcon className="w-4 h-4" />} onClick={() => {}} />
             <ToolBtn icon={<ShareIcon className="w-4 h-4" />} onClick={() => {}} />
          </div>
        </header>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-10 pt-12 pb-44">
          {currentView === AppView.FEED && (
            <div className="max-w-6xl mx-auto">
              {fragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-center opacity-40">
                  <SparklesIcon className="w-12 h-12 mb-4 text-black" />
                  <p className="text-[11px] font-bold tracking-widest uppercase text-black">Capture Your Thoughts</p>
                </div>
              ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
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
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
              {!aiResult ? (
                <div className="text-center py-40">
                  <p className="text-slate-500 text-[11px] font-bold tracking-widest uppercase mb-8">No Plan Generated</p>
                  <button onClick={handleOrganize} className="px-10 py-3.5 bg-black text-white rounded-full font-bold text-xs shadow-xl shadow-black/10 hover:bg-slate-800 active:scale-95 transition-all">
                    Generate System Plan
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <LovartDetailSection title="Focus Area" items={aiResult.themes} />
                  <LovartDetailSection title="Action Items" items={aiResult.actionItems} />
                  <LovartDetailSection title="Opportunities" items={aiResult.opportunities} />
                  <div className="col-span-full p-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-8">Synthesis</h3>
                    <p className="text-black leading-loose text-lg font-medium tracking-tight">{aiResult.summary}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === AppView.BRAINSTORM && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              {!aiResult?.length ? (
                <div className="text-center py-40 text-slate-500 text-[11px] font-bold tracking-widest uppercase">Select a card to start brainstorm</div>
              ) : (
                <div className="grid gap-6">
                  {aiResult.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
                        {item.complexity} Complexity
                      </span>
                      <h4 className="text-xl font-bold text-black mb-3">{item.concept}</h4>
                      <p className="text-slate-600 leading-relaxed font-medium">{item.reasoning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === AppView.REVIEW && (
             <div className="max-w-4xl mx-auto">
               <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-sm">
                 <h3 className="text-2xl font-bold text-black mb-10">Review Reflection</h3>
                 {aiResult?.summary ? (
                   <div className="space-y-6">
                      {aiResult.summary.split('\n').filter(Boolean).map((para: string, i: number) => (
                        <p key={i} className="text-slate-700 text-lg leading-loose font-medium">{para}</p>
                      ))}
                   </div>
                 ) : (
                    <div className="text-center">
                       <button onClick={handleWeeklyReview} className="px-10 py-4 bg-black text-white rounded-full font-bold text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
                         Start Analysis
                       </button>
                    </div>
                 )}
               </div>
             </div>
          )}
        </div>

        {/* Lovart 标志性悬浮输入岛 */}
        {currentView === AppView.FEED && (
          <div className="absolute bottom-10 left-0 right-0 px-8 z-30 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-xl p-2.5 pl-7 rounded-full shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] flex items-center gap-5 border border-white">
                
                <div className="flex items-center gap-1.5 border-r border-slate-100 pr-5">
                   <ToolBtn icon={<AttachmentIcon className="w-5 h-5" />} onClick={() => {}} />
                   <ToolBtn icon={<MentionIcon className="w-5 h-5" />} onClick={() => {}} />
                   <ToolBtn icon={<SparklesIcon className="w-5 h-5 text-blue-600" />} onClick={handleOrganize} />
                </div>

                <input 
                  id="main-input"
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFragment()}
                  placeholder="Record thoughts or type / for commands..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-black py-3.5 text-sm font-medium placeholder:text-slate-400"
                />

                <div className="flex items-center gap-1.5 pr-1.5">
                   <div className="hidden lg:flex items-center gap-1 mr-3">
                     <ToolBtn icon={<BrainIcon className="w-4 h-4" />} onClick={() => {}} />
                     <ToolBtn icon={<SearchIcon className="w-4 h-4" />} onClick={() => {}} />
                   </div>
                   <button 
                    onClick={addFragment}
                    disabled={!inputValue.trim()}
                    className="w-11 h-11 bg-black disabled:bg-slate-50 disabled:text-slate-300 text-white rounded-full flex items-center justify-center transition-all hover:bg-slate-800 active:scale-90 shadow-lg shadow-black/5"
                  >
                    <SendIcon className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400 font-bold tracking-widest mt-4 uppercase">Lumina Space v1.0</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- 精确复刻 Lovart 风格的辅助组件 ---

// 统一图标按钮 - 纯黑图标 + 极浅灰色悬停背景
const ToolBtn = ({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="p-2.5 text-black hover:bg-slate-100 rounded-xl transition-all active:scale-95 group relative flex items-center justify-center"
  >
    {React.cloneElement(icon as React.ReactElement, { className: `${(icon as any).props.className || 'w-5 h-5'} transition-transform group-active:scale-90` })}
  </button>
);

// 侧边栏按钮 - 活跃态带背景点 + 深色气泡提示
const LovartSidebarBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative group ${active ? 'bg-slate-100 text-black shadow-sm' : 'text-black hover:bg-slate-50'}`}
  >
    {icon}
    {active && (
      <div className="absolute -left-6 w-1 h-1 bg-black rounded-full animate-in fade-in zoom-in duration-300 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
    )}
    {/* 深色极简气泡提示 - 对齐 Lovart 截图 */}
    <div className="absolute left-16 px-3 py-2 bg-[#121212] text-white text-[11px] font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all -translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
      {label}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#121212] rotate-45 rounded-sm -z-10" />
    </div>
  </button>
);

// 碎片卡片
const FragmentCard: React.FC<{ fragment: any, onDelete: any, onToggleTodo: any, onBrainstorm: any }> = ({ fragment, onDelete, onToggleTodo, onBrainstorm }) => {
  const isTodo = fragment.content.toLowerCase().startsWith('todo:') || fragment.type === 'todo';
  const cleanContent = fragment.content.replace(/^todo:\s*/i, '');

  return (
    <div className="break-inside-avoid bg-white p-9 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all group relative">
      <div className="flex gap-6">
        {isTodo && (
          <button 
            onClick={onToggleTodo}
            className={`w-6 h-6 mt-1 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${fragment.status === 'completed' ? 'bg-black border-black shadow-lg shadow-black/10' : 'border-slate-300 hover:border-black'}`}
          >
            {fragment.status === 'completed' && <PlusIcon className="w-3 h-3 text-white rotate-45" />}
          </button>
        )}
        <div className="flex-1">
          <p className={`text-black leading-relaxed font-medium text-[1.1rem] tracking-tight transition-all ${fragment.status === 'completed' ? 'opacity-25 line-through' : ''}`}>
            {cleanContent}
          </p>
          <div className="mt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                 {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <div className="w-1 h-1 bg-slate-200 rounded-full" />
               <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Insight</span>
            </div>
            <div className="flex items-center gap-1">
              <ToolBtn icon={<BrainIcon className="w-4 h-4" />} onClick={onBrainstorm} />
              <ToolBtn icon={<PlusIcon className="w-4 h-4 rotate-45 text-black" />} onClick={() => onDelete(fragment.id)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI 详情版块
const LovartDetailSection = ({ title, items }: { title: string, items: string[] }) => (
  <div className="p-11 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <h4 className="font-black text-[11px] tracking-[0.2em] uppercase mb-10 text-slate-400 cursor-default">
      {title}
    </h4>
    <ul className="space-y-5">
      {items.map((item, i) => (
        <li key={i} className="text-sm font-bold text-slate-700 flex gap-4 leading-relaxed group cursor-default">
          <div className="w-1.5 h-1.5 bg-black/10 rounded-full mt-2 group-hover:bg-black transition-all flex-shrink-0" />
          <span className="group-hover:text-black transition-colors">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default App;
