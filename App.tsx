
import React, { useState, useEffect } from 'react';
import { Fragment, AppView } from './types';
import { brainstormFromIdea, organizeFragments, generateReview } from './services/geminiService';
import { 
  PlusIcon, SparklesIcon, BrainIcon, ListIcon, CalendarIcon,
  AttachmentIcon, MentionIcon, SearchIcon, SendIcon, ShareIcon
} from './components/Icons';

// --- 一致性紧凑型设计系统组件 ---

type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

const IconButton = ({ 
  icon, 
  onClick, 
  label, 
  active = false, 
  tooltipPos = 'top',
  size = 'md',
  variant = 'ghost',
  disabled = false
}: { 
  icon: React.ReactNode, 
  onClick?: () => void, 
  label: string, 
  active?: boolean,
  tooltipPos?: TooltipPos,
  size?: 'sm' | 'md' | 'lg',
  variant?: 'ghost' | 'solid' | 'tint',
  disabled?: boolean
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg p-1',
    md: 'w-9 h-9 rounded-xl p-2',
    lg: 'w-11 h-11 rounded-2xl p-2.5'
  };

  const variantClasses = {
    ghost: active ? 'bg-slate-100 text-black shadow-inner' : 'text-slate-400 hover:bg-slate-100/80 hover:text-black',
    solid: 'bg-black text-white shadow-md hover:bg-zinc-800 disabled:bg-slate-200',
    tint: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
  };

  const tooltipBase = "absolute px-2.5 py-1.5 bg-[#121212] text-white text-[9px] font-bold rounded-[12px] opacity-0 scale-90 pointer-events-none transition-all duration-200 z-[100] whitespace-nowrap shadow-2xl tracking-tight";
  
  const posMap = {
    top: `${tooltipBase} bottom-full left-1/2 -translate-x-1/2 mb-2 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0`,
    bottom: `${tooltipBase} top-full left-1/2 -translate-x-1/2 mt-2 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0`,
    left: `${tooltipBase} right-full top-1/2 -translate-y-1/2 mr-2 translate-x-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0`,
    right: `${tooltipBase} left-full top-1/2 -translate-y-1/2 ml-2 -translate-x-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0`
  };

  const arrowBase = "absolute w-1.5 h-1.5 bg-[#121212] rotate-45 rounded-[0.5px]";
  const arrowPos = {
    top: `${arrowBase} -bottom-0.5 left-1/2 -translate-x-1/2`,
    bottom: `${arrowBase} -top-0.5 left-1/2 -translate-x-1/2`,
    left: `${arrowBase} -right-0.5 top-1/2 -translate-y-1/2`,
    right: `${arrowBase} -left-0.5 top-1/2 -translate-y-1/2`
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex items-center justify-center transition-all duration-200 active:scale-90 ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-full h-full stroke-[2]' })}
      <div className={posMap[tooltipPos]}>
        {label}
        <div className={arrowPos[tooltipPos]} />
      </div>
    </button>
  );
};

// --- 应用主逻辑 ---

const App: React.FC = () => {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.FEED);
  const [inputValue, setInputValue] = useState('');
  const [assistantInput, setAssistantInput] = useState('');
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
    setCurrentView(AppView.PLANNING);
    try {
      const result = await organizeFragments(fragments);
      setAiResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBrainstorm = async (idea: string) => {
    setIsAiLoading(true);
    setCurrentView(AppView.BRAINSTORM);
    try {
      const result = await brainstormFromIdea(idea);
      setAiResult({ idea, storm: result });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReview = async () => {
    if (fragments.length === 0) return;
    setIsAiLoading(true);
    setCurrentView(AppView.REVIEW);
    try {
      const result = await generateReview(fragments);
      setAiResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const deleteFragment = (id: string) => {
    setFragments(prev => prev.filter(f => f.id !== id));
  };

  const toggleTodo = (id: string) => {
    setFragments(prev => prev.map(f => {
        if (f.id === id) {
            return { ...f, type: f.type === 'todo' ? 'fragment' : 'todo', status: f.status || 'pending' };
        }
        return f;
    }));
  };

  return (
    <div className="flex h-screen bg-[#F4F4F7] text-[#121212] overflow-hidden p-4 gap-4">
      
      {/* 侧边栏导航：采用紧凑的垂直边距 */}
      <nav className="w-[58px] bg-white rounded-[24px] shadow-lovart-md border border-white flex flex-col items-center py-5 z-20 flex-shrink-0 self-center h-fit">
        <div className="flex flex-col gap-2.5">
          <IconButton size="md" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21l-9-9 9-9 9 9-9 9z" /></svg>} label="灵感画布" active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} tooltipPos="right" />
          <IconButton size="md" icon={<ListIcon />} label="规划管理" active={currentView === AppView.PLANNING} onClick={handleOrganize} tooltipPos="right" />
          <IconButton size="md" icon={<BrainIcon />} label="风暴发散" active={currentView === AppView.BRAINSTORM} tooltipPos="right" />
          <IconButton size="md" icon={<CalendarIcon />} label="复盘回顾" active={currentView === AppView.REVIEW} onClick={handleReview} tooltipPos="right" />
          <div className="w-6 h-[1px] bg-slate-50 my-1 self-center" />
          <IconButton size="md" icon={<ShareIcon />} label="导出共享" tooltipPos="right" />
        </div>
      </nav>

      {/* 主画布区 */}
      <main className="flex-1 relative overflow-hidden bg-white/40 rounded-[28px] border border-white/70 shadow-inner flex flex-col">
        {/* 顶栏控制 */}
        <header className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-20">
          <div className="bg-white/95 backdrop-blur-xl px-2.5 py-1 rounded-[14px] shadow-sm border border-white pointer-events-auto flex items-center gap-2.5">
             <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white font-black text-[8px]">LU</div>
             <div className="flex items-center gap-1 cursor-pointer group">
                <span className="text-[12px] font-bold text-slate-800 tracking-tight">
                    {currentView === AppView.FEED ? '无限灵感画布' : 
                     currentView === AppView.PLANNING ? 'AI 智能规划' : 
                     currentView === AppView.REVIEW ? '深度复盘' : '创意中心'}
                </span>
                <svg className="w-2 h-2 text-slate-300 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>
          <div className="bg-white/95 backdrop-blur-xl px-3 py-1 rounded-[14px] shadow-sm border border-white pointer-events-auto flex items-center gap-3">
             <button className="text-slate-400 hover:text-black transition-colors p-0.5"><PlusIcon className="w-3 h-3 rotate-45" /></button>
             <span className="text-[10px] font-black text-slate-500 tracking-tighter">100%</span>
             <button className="text-slate-400 hover:text-black transition-colors p-0.5"><PlusIcon className="w-3 h-3" /></button>
          </div>
        </header>

        {/* 画布核心内容 */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-12 pt-28 pb-48">
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 animate-pulse">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-400">Gemini 正在重构思维...</p>
            </div>
          ) : currentView === AppView.FEED ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {fragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 opacity-5 select-none grayscale scale-110">
                   <SparklesIcon className="w-14 h-14 mb-4" />
                   <p className="text-[9px] font-black tracking-[0.4em] uppercase">Capture Your Spark</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {fragments.map(f => (
                    <CanvasCard key={f.id} fragment={f} onDelete={() => deleteFragment(f.id)} onToggleTodo={() => toggleTodo(f.id)} onBrainstorm={() => handleBrainstorm(f.content)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white p-10 rounded-[32px] shadow-lovart-lg border border-white min-h-[400px]">
                {currentView === AppView.PLANNING && aiResult && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center"><CalendarIcon className="w-3.5 h-3.5 text-white" /></div>
                            <h2 className="text-xl font-black">AI 智能规划建议</h2>
                        </div>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">{aiResult.summary}</p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">核心主题</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {aiResult.themes?.map((t: string, i: number) => <span key={i} className="px-2.5 py-1 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100">{t}</span>)}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">行动事项</h3>
                                <div className="space-y-1.5">
                                    {aiResult.actionItems?.map((a: string, i: number) => <div key={i} className="flex items-center gap-2 text-[12px] font-bold"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{a}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentView === AppView.REVIEW && aiResult && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center"><BrainIcon className="w-3.5 h-3.5 text-white" /></div>
                            <h2 className="text-xl font-black">复盘总结</h2>
                        </div>
                        <div className="prose prose-sm prose-slate font-bold text-slate-600 leading-[1.7] whitespace-pre-wrap">
                            {aiResult}
                        </div>
                    </div>
                )}
                {currentView === AppView.BRAINSTORM && aiResult && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center"><SparklesIcon className="w-3.5 h-3.5 text-white" /></div>
                            <h2 className="text-xl font-black">创意发散</h2>
                        </div>
                        <div className="grid gap-3">
                            {aiResult.storm?.map((s: any, i: number) => (
                                <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-white hover:bg-white transition-all group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="font-black text-sm text-blue-600">{s.concept}</h4>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${s.complexity === 'High' ? 'bg-red-50 text-red-400' : 'bg-green-50 text-green-400'}`}>{s.complexity}</span>
                                    </div>
                                    <p className="text-[12px] font-bold text-slate-400 leading-snug">{s.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <button 
                  onClick={() => setCurrentView(AppView.FEED)}
                  className="mt-10 px-6 py-2 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                >
                  返回画布
                </button>
            </div>
          )}
        </div>

        {/* 底部悬浮录入：保持紧凑高度 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-2xl p-2 pl-6 rounded-full shadow-lovart-lg flex items-center gap-4 border border-white pointer-events-auto hover:shadow-2xl transition-all">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFragment()}
              placeholder="记录灵光一闪..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[14px] font-bold text-black py-2 placeholder:text-slate-300"
            />
            <IconButton icon={<SendIcon />} label="提交记录" variant="solid" size="md" tooltipPos="top" onClick={addFragment} />
          </div>
        </div>
      </main>

      {/* 右侧 AI 助手面板：全面紧凑化 */}
      <aside className="w-[340px] bg-white rounded-[28px] shadow-lovart-md border border-white flex flex-col z-30 flex-shrink-0 overflow-hidden">
        <header className="h-[60px] flex items-center justify-end px-4 gap-0.5 flex-shrink-0 border-b border-slate-50/50">
           <IconButton icon={<PlusIcon />} label="重置对话" size="sm" tooltipPos="bottom" />
           <IconButton icon={<SearchIcon />} label="搜索" size="sm" tooltipPos="bottom" />
           <IconButton icon={<ShareIcon />} label="导出" size="sm" tooltipPos="bottom" />
           <IconButton icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>} label="极简" size="sm" tooltipPos="left" />
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
          <div className="mb-8">
             <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center mb-4 shadow-md transition-all hover:scale-105">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h1 className="text-[18px] font-black text-black tracking-tight mb-1 leading-tight">AI 智能管家</h1>
             <p className="text-slate-400 font-bold text-sm tracking-tight">将碎片记录转化为有序生产力。</p>
          </div>

          <div className="space-y-4 mb-6">
             <PromptCard 
               title="极速规划" 
               subtitle="深度分析画布想法，一键排期。" 
               onClick={handleOrganize}
               images={[
                 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=120&h=180&fit=crop',
                 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=120&h=180&fit=crop'
               ]}
             />
             <PromptCard 
               title="深度复盘" 
               subtitle="回顾历程，总结成长路径。" 
               onClick={handleReview}
               images={[
                 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?w=120&h=180&fit=crop',
                 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=120&h=180&fit=crop'
               ]}
             />
          </div>

          <div className="flex items-center gap-1.5 mb-6 text-slate-300 hover:text-black cursor-pointer transition-all text-[9px] font-black uppercase tracking-[0.2em] group">
             <svg className="w-3 h-3 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             AI 模型：GEMINI 3 PRO
          </div>

          <div className="bg-[#F0F7FF] p-4 rounded-[20px] flex items-center justify-between group cursor-pointer hover:bg-[#E3EFFF] transition-all border border-[#E1EEFF] mb-8 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                   <PlusIcon className="w-4 h-4" />
                </div>
                <div className="text-[9px] font-black text-blue-700 tracking-tight leading-tight uppercase">
                   升级 LUMINA PRO<br/><span className="opacity-40 font-bold">获取 1K 解析力</span>
                </div>
             </div>
             <IconButton size="sm" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>} label="隐藏" />
          </div>
        </div>

        {/* AI 输入区：紧凑表单 */}
        <div className="p-4 border-t border-slate-50 flex-shrink-0">
          <div className="bg-[#FBFBFC] rounded-[22px] p-4 border border-slate-100 transition-all focus-within:shadow-md focus-within:border-slate-200">
             <textarea 
               value={assistantInput}
               onChange={(e) => setAssistantInput(e.target.value)}
               placeholder="描述你想如何整理想法..."
               className="w-full bg-transparent border-none focus:outline-none resize-none h-20 text-[13px] font-semibold text-black placeholder:text-slate-300 leading-snug mb-3 scrollbar-hide"
             />
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                   <IconButton icon={<AttachmentIcon />} label="附件" size="sm" tooltipPos="top" />
                   <IconButton icon={<MentionIcon />} label="提及" size="sm" tooltipPos="top" />
                   <IconButton icon={<SparklesIcon />} label="增强" size="sm" variant="tint" tooltipPos="top" />
                </div>
                <div className="flex items-center gap-0.5">
                   <IconButton icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} label="风暴" size="sm" tooltipPos="top" />
                   <button 
                     disabled={!assistantInput.trim()}
                     className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ml-1 shadow-sm ${assistantInput.trim() ? 'bg-black text-white hover:scale-105' : 'bg-[#F1F1F4] text-slate-300'}`}
                   >
                     <svg className="w-4 h-4 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19l7-7-7-7M5 12h14" /></svg>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// --- 精致级紧凑卡片组件 ---

const PromptCard = ({ title, subtitle, images, onClick }: { title: string, subtitle: string, images: string[], onClick?: () => void }) => (
  <div 
    onClick={onClick} 
    className="bg-[#F8F9FA] p-4 pr-1.5 rounded-[20px] flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-lovart-md border border-transparent hover:border-slate-100 transition-all h-[96px]"
  >
    <div className="flex-1 pr-2">
      <h4 className="text-[12.5px] font-black text-black mb-0.5 group-hover:text-blue-600 tracking-tight">{title}</h4>
      <p className="text-slate-400 text-[9.5px] font-bold leading-tight line-clamp-2">{subtitle}</p>
    </div>
    <div className="flex -space-x-6 relative pr-3">
      {images.map((url, i) => (
        <div 
          key={i} 
          className={`w-11 h-15 rounded-lg overflow-hidden border-2 border-white shadow-lovart-sm transition-all duration-300 transform origin-bottom-right ${i === 0 ? 'rotate-[12deg] group-hover:rotate-0' : 'rotate-[-4deg] group-hover:rotate-0 scale-95 translate-x-1.5'}`} 
          style={{zIndex: images.length - i}}
        >
          <img src={url} alt="card" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
);

const CanvasCard: React.FC<{ 
  fragment: Fragment, 
  onDelete: () => void, 
  onToggleTodo: () => void,
  onBrainstorm: () => void 
}> = ({ fragment, onDelete, onToggleTodo, onBrainstorm }) => (
  <div className={`bg-white p-8 rounded-[36px] border transition-all duration-400 group relative ${fragment.type === 'todo' ? 'border-blue-50 shadow-lovart-sm' : 'border-white shadow-lovart-md hover:shadow-lovart-lg'}`}>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-4">
          {fragment.type === 'todo' && (
              <div className="px-1.5 py-0.5 bg-blue-50 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded">TODO</div>
          )}
          <span className="text-[8px] font-black tracking-[0.1em] text-slate-200 uppercase">
            CAPTURED {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
      </div>
      <p className={`text-black leading-relaxed font-bold text-[1.15rem] tracking-tight mb-6 ${fragment.type === 'todo' && fragment.status === 'completed' ? 'line-through opacity-25' : ''}`}>
        {fragment.content}
      </p>
      <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
        <div className="flex items-center gap-2">
            <button 
              onClick={onToggleTodo}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${fragment.type === 'todo' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}
            >
                {fragment.type === 'todo' ? 'Done' : '+ 待办'}
            </button>
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={<BrainIcon />} label="发散" size="sm" tooltipPos="top" onClick={onBrainstorm} />
          <IconButton icon={<PlusIcon />} label="移除" size="sm" tooltipPos="top" onClick={onDelete} />
        </div>
      </div>
    </div>
  </div>
);

export default App;
