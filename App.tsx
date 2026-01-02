
import React, { useState, useEffect } from 'react';
import { Fragment, AppView } from './types';
import { brainstormFromIdea, organizeFragments, generateReview } from './services/geminiService';
import { 
  PlusIcon, SparklesIcon, BrainIcon, ListIcon, CalendarIcon,
  AttachmentIcon, MentionIcon, SearchIcon, SendIcon, ShareIcon
} from './components/Icons';

// --- 一致性设计系统组件 ---

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
    sm: 'w-8 h-8 rounded-lg p-1.5',
    md: 'w-10 h-10 rounded-xl p-2.5',
    lg: 'w-12 h-12 rounded-2xl p-3'
  };

  const variantClasses = {
    ghost: active ? 'bg-slate-100 text-black shadow-inner' : 'text-slate-400 hover:bg-slate-100/80 hover:text-black',
    solid: 'bg-black text-white shadow-md hover:bg-zinc-800 disabled:bg-slate-200',
    tint: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
  };

  const tooltipBase = "absolute px-3 py-1.5 bg-[#121212] text-white text-[10px] font-bold rounded-[14px] opacity-0 scale-90 pointer-events-none transition-all duration-200 z-[100] whitespace-nowrap shadow-2xl tracking-tight";
  
  const posMap = {
    top: `${tooltipBase} bottom-full left-1/2 -translate-x-1/2 mb-2 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0`,
    bottom: `${tooltipBase} top-full left-1/2 -translate-x-1/2 mt-2 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0`,
    left: `${tooltipBase} right-full top-1/2 -translate-y-1/2 mr-2 translate-x-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0`,
    right: `${tooltipBase} left-full top-1/2 -translate-y-1/2 ml-2 -translate-x-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0`
  };

  const arrowBase = "absolute w-2 h-2 bg-[#121212] rotate-45 rounded-[1px]";
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
      {React.cloneElement(icon as React.ReactElement, { className: 'w-full h-full stroke-[1.8]' })}
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
    <div className="flex h-screen bg-[#F4F4F7] text-[#121212] overflow-hidden p-5 gap-5">
      
      {/* 侧边栏导航 */}
      <nav className="w-[64px] bg-white rounded-[28px] shadow-lovart-md border border-white flex flex-col items-center py-8 z-20 flex-shrink-0 self-center h-fit">
        <div className="flex flex-col gap-3.5">
          <IconButton icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21l-9-9 9-9 9 9-9 9z" /></svg>} label="想法画布" active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} tooltipPos="right" />
          <IconButton icon={<ListIcon />} label="规划/待办" active={currentView === AppView.PLANNING} onClick={handleOrganize} tooltipPos="right" />
          <IconButton icon={<BrainIcon />} label="头脑风暴" active={currentView === AppView.BRAINSTORM} tooltipPos="right" />
          <IconButton icon={<CalendarIcon />} label="深度复盘" active={currentView === AppView.REVIEW} onClick={handleReview} tooltipPos="right" />
          <div className="w-8 h-[1px] bg-slate-100 my-2" />
          <IconButton icon={<ShareIcon />} label="协作共享" tooltipPos="right" />
        </div>
      </nav>

      {/* 主工作区 */}
      <main className="flex-1 relative overflow-hidden bg-white/40 rounded-[34px] border border-white/70 shadow-inner flex flex-col">
        {/* 顶栏控制 */}
        <header className="absolute top-5 left-5 right-5 flex justify-between items-center pointer-events-none z-20">
          <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-[18px] shadow-sm border border-white pointer-events-auto flex items-center gap-3">
             <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white font-black text-[9px]">LUM</div>
             <div className="flex items-center gap-1 cursor-pointer group">
                <span className="text-[13px] font-bold text-slate-800 tracking-tight">
                    {currentView === AppView.FEED ? '无限灵感画布' : 
                     currentView === AppView.PLANNING ? 'AI 智能规划' : 
                     currentView === AppView.REVIEW ? '深度成长复盘' : '创意发散中心'}
                </span>
                <svg className="w-2.5 h-2.5 text-slate-300 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>
          <div className="bg-white/95 backdrop-blur-xl px-4 py-1.5 rounded-[18px] shadow-sm border border-white pointer-events-auto flex items-center gap-4">
             <button className="text-slate-400 hover:text-black transition-colors p-0.5"><PlusIcon className="w-3.5 h-3.5 rotate-45" /></button>
             <span className="text-[11px] font-black text-slate-500 tracking-tighter">100%</span>
             <button className="text-slate-400 hover:text-black transition-colors p-0.5"><PlusIcon className="w-3.5 h-3.5" /></button>
          </div>
        </header>

        {/* 画布核心内容 */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-16 pt-32 pb-60">
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-400">Gemini 正在重构你的思维结构...</p>
            </div>
          ) : currentView === AppView.FEED ? (
            <div className="max-w-4xl mx-auto">
              {fragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-44 opacity-10 select-none grayscale scale-125">
                   <SparklesIcon className="w-16 h-16 mb-6" />
                   <p className="text-[10px] font-black tracking-[0.5em] uppercase">Start Recording Thoughts</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {fragments.map(f => (
                    <CanvasCard key={f.id} fragment={f} onDelete={() => deleteFragment(f.id)} onToggleTodo={() => toggleTodo(f.id)} onBrainstorm={() => handleBrainstorm(f.content)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white p-12 rounded-[40px] shadow-lovart-lg border border-white min-h-[500px]">
                {currentView === AppView.PLANNING && aiResult && (
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"><CalendarIcon className="w-4 h-4 text-white" /></div>
                            <h2 className="text-2xl font-black">AI 智能规划建议</h2>
                        </div>
                        <p className="text-slate-500 font-bold leading-relaxed">{aiResult.summary}</p>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">核心主题</h3>
                                <div className="flex flex-wrap gap-2">
                                    {aiResult.themes?.map((t: string, i: number) => <span key={i} className="px-3 py-1.5 bg-slate-100 rounded-full text-[12px] font-bold">{t}</span>)}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">行动事项</h3>
                                <div className="space-y-2">
                                    {aiResult.actionItems?.map((a: string, i: number) => <div key={i} className="flex items-center gap-2 text-[13px] font-bold"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{a}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentView === AppView.REVIEW && aiResult && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"><BrainIcon className="w-4 h-4 text-white" /></div>
                            <h2 className="text-2xl font-black">深度复盘摘要</h2>
                        </div>
                        <div className="prose prose-slate font-bold text-slate-600 leading-[1.8] whitespace-pre-wrap">
                            {aiResult}
                        </div>
                    </div>
                )}
                {currentView === AppView.BRAINSTORM && aiResult && (
                    <div className="space-y-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">针对想法：</span>
                            <h2 className="text-xl font-black mt-1">"{aiResult.idea}"</h2>
                        </div>
                        <div className="grid gap-4">
                            {aiResult.storm?.map((s: any, i: number) => (
                                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-white hover:bg-white hover:shadow-lovart-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-black text-blue-600">{s.concept}</h4>
                                        <span className={`text-[9px] font-black px-2 py-1 rounded-md ${s.complexity === 'High' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{s.complexity}</span>
                                    </div>
                                    <p className="text-[13px] font-bold text-slate-500">{s.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <button 
                  onClick={() => setCurrentView(AppView.FEED)}
                  className="mt-12 px-8 py-3 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                >
                  返回画布
                </button>
            </div>
          )}
        </div>

        {/* 底部悬浮录入 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-3xl p-3 pl-8 rounded-full shadow-lovart-lg flex items-center gap-6 border border-white pointer-events-auto hover:shadow-2xl transition-all duration-500">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFragment()}
              placeholder="捕捉此时此刻的思维碎片..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-bold text-black py-3 placeholder:text-slate-300"
            />
            <IconButton icon={<SendIcon />} label="记录碎片" variant="solid" size="md" tooltipPos="top" onClick={addFragment} />
          </div>
        </div>
      </main>

      {/* 右侧 AI 助手面板 */}
      <aside className="w-[380px] bg-white rounded-[32px] shadow-lovart-md border border-white flex flex-col z-30 flex-shrink-0">
        <header className="h-[76px] flex items-center justify-end px-5 gap-1 flex-shrink-0 border-b border-slate-50/50">
           <IconButton icon={<PlusIcon />} label="清空上下文" size="sm" tooltipPos="bottom" />
           <IconButton icon={<SearchIcon />} label="全局搜索" size="sm" tooltipPos="bottom" />
           <IconButton icon={<ShareIcon />} label="导出结果" size="sm" tooltipPos="bottom" />
           <IconButton icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>} label="聚焦模式" size="sm" tooltipPos="left" />
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-4">
          <div className="mb-10 mt-4">
             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-6 shadow-md transition-all hover:scale-110">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h1 className="text-[23px] font-black text-black tracking-tight mb-2 leading-tight">AI 智能管家</h1>
             <p className="text-slate-400 font-bold text-lg leading-snug tracking-tight">为您处理碎片化记录，转化为生产力。</p>
          </div>

          <div className="space-y-5 mb-8">
             <PromptCard 
               title="一键规划整理" 
               subtitle="深度分析画布中散落的想法，为您生成今日/本周的任务规划。" 
               onClick={handleOrganize}
               images={[
                 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=120&h=180&fit=crop',
                 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=120&h=180&fit=crop'
               ]}
             />
             <PromptCard 
               title="深度复盘分析" 
               subtitle="回顾历史碎片，总结成长路径与关键阻碍，生成启发性摘要。" 
               onClick={handleReview}
               images={[
                 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?w=120&h=180&fit=crop',
                 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=120&h=180&fit=crop'
               ]}
             />
          </div>

          <div className="flex items-center gap-2 mb-8 text-slate-400 hover:text-black cursor-pointer transition-all text-[11px] font-black uppercase tracking-[0.25em] group">
             <svg className="w-4 h-4 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             切换 AI 模式
          </div>

          <div className="bg-[#F0F7FF] p-5 rounded-[26px] flex items-center justify-between group cursor-pointer hover:bg-[#E3EFFF] transition-all border border-[#E1EEFF] mb-12 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                   <PlusIcon className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-black text-blue-700 tracking-tight leading-tight uppercase">
                   升级 Lumina Pro<br/><span className="opacity-40 font-bold">获取 365 天无限推理次数！</span>
                </div>
             </div>
             <IconButton icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>} label="关闭" size="sm" />
          </div>
        </div>

        {/* AI 输入区 */}
        <div className="p-6 border-t border-slate-50 flex-shrink-0">
          <div className="bg-[#FBFBFC] rounded-[28px] p-5 border border-slate-200 transition-all focus-within:shadow-lovart-md focus-within:border-slate-300">
             <textarea 
               value={assistantInput}
               onChange={(e) => setAssistantInput(e.target.value)}
               placeholder="描述你想如何整理想法..."
               className="w-full bg-transparent border-none focus:outline-none resize-none h-24 text-[15px] font-semibold text-black placeholder:text-slate-300 leading-relaxed mb-4 scrollbar-hide"
             />
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                   <IconButton icon={<AttachmentIcon />} label="附件" size="sm" tooltipPos="top" />
                   <IconButton icon={<MentionIcon />} label="提及" size="sm" tooltipPos="top" />
                   <IconButton icon={<SparklesIcon />} label="AI 整理" size="sm" variant="tint" tooltipPos="top" />
                </div>
                <div className="flex items-center gap-1">
                   <IconButton icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} label="灵感风暴" size="sm" tooltipPos="top" />
                   <button 
                     disabled={!assistantInput.trim()}
                     className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ml-1.5 shadow-sm ${assistantInput.trim() ? 'bg-black text-white hover:scale-110' : 'bg-[#F1F1F4] text-slate-300'}`}
                   >
                     <svg className="w-5 h-5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19l7-7-7-7M5 12h14" /></svg>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// --- 精致级 UI 卡片组件 ---

const PromptCard = ({ title, subtitle, images, onClick }: { title: string, subtitle: string, images: string[], onClick?: () => void }) => (
  <div 
    onClick={onClick} 
    className="bg-[#F8F9FA] p-5 pr-2 rounded-[28px] flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-lovart-md border border-transparent hover:border-slate-100 transition-all duration-400 overflow-hidden h-[120px]"
  >
    <div className="flex-1 pr-3">
      <h4 className="text-[14px] font-black text-black mb-1 group-hover:text-blue-600 transition-colors tracking-tight">{title}</h4>
      <p className="text-slate-400 text-[10.5px] font-bold leading-tight line-clamp-2">{subtitle}</p>
    </div>
    <div className="flex -space-x-8 relative pr-4">
      {images.map((url, i) => (
        <div 
          key={i} 
          className={`w-14 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lovart-sm transition-all duration-500 transform origin-bottom-right ${i === 0 ? 'rotate-[15deg] group-hover:rotate-0' : 'rotate-[-5deg] group-hover:rotate-0 scale-95 translate-x-2'}`} 
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
  <div className={`bg-white p-12 rounded-[48px] border transition-all duration-500 group relative ${fragment.type === 'todo' ? 'border-blue-100 shadow-lovart-sm' : 'border-white shadow-lovart-md hover:shadow-lovart-lg'}`}>
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-6">
          {fragment.type === 'todo' && (
              <div className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded">To-Do Item</div>
          )}
          <span className="text-[9px] font-black tracking-[0.2em] text-slate-200 uppercase">
            Captured {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
      </div>
      <p className={`text-black leading-relaxed font-bold text-[1.4rem] tracking-tight mb-10 ${fragment.type === 'todo' && fragment.status === 'completed' ? 'line-through opacity-30' : ''}`}>
        {fragment.content}
      </p>
      <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center gap-3">
            <button 
              onClick={onToggleTodo}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${fragment.type === 'todo' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}
            >
                {fragment.type === 'todo' ? '✓ Mark Done' : '+ 转为待办'}
            </button>
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton icon={<BrainIcon />} label="基于该点风暴" size="sm" tooltipPos="top" onClick={onBrainstorm} />
          <IconButton icon={<PlusIcon />} label="清理节点" size="sm" tooltipPos="top" onClick={onDelete} />
        </div>
      </div>
    </div>
  </div>
);

export default App;
