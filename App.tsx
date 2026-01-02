
import React, { useState, useEffect, useRef } from 'react';
import { Fragment, AppView, NoteType } from './types';
import { brainstormFromIdea, organizeFragments, generateReview } from './services/geminiService';
import { 
  PlusIcon, SparklesIcon, BrainIcon, ListIcon, CalendarIcon,
  AttachmentIcon, MentionIcon, SearchIcon, SendIcon, ShareIcon
} from './components/Icons';

// --- 初始 Mock 数据 ---
const INITIAL_MOCK_DATA: Fragment[] = [
  {
    id: 'mock-1',
    content: "下个季度想尝试用 WebGPU 重构渲染管线，提升移动端 3D 画布的流畅度。",
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    tags: ['技术探索', '工作'],
    type: 'fragment',
    status: 'pending'
  },
  {
    id: 'mock-2',
    content: "灵感：一个基于物理引擎的笔记应用，所有的碎片像原子一样可以互相吸引或排斥。",
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5小时前
    tags: ['创意', '产品'],
    type: 'fragment',
    status: 'pending'
  },
  {
    id: 'mock-3',
    content: "准备周一的团队同步周报，重点讨论 AI 录入系统的准确率提升方案。",
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1天前
    tags: ['待办', '管理'],
    type: 'todo',
    status: 'pending'
  },
  {
    id: 'mock-4',
    content: "书单推荐：卡洛·罗韦利的《时间的秩序》，探讨物理学与时间的本质。",
    createdAt: Date.now() - 1000 * 60 * 60 * 28, // 1.2天前
    tags: ['阅读', '自我提升'],
    type: 'fragment',
    status: 'pending'
  },
  {
    id: 'mock-5',
    content: "周六去那家新开的咖啡店试试他们的埃塞俄比亚手冲，顺便带上 iPad 写写代码。",
    createdAt: Date.now() - 1000 * 60 * 60 * 48, // 2天前
    tags: ['生活', '探店'],
    type: 'todo',
    status: 'pending'
  }
];

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
  disabled = false,
  className = ""
}: { 
  icon: React.ReactNode, 
  onClick?: () => void, 
  label: string, 
  active?: boolean,
  tooltipPos?: TooltipPos,
  size?: 'sm' | 'md' | 'lg',
  variant?: 'ghost' | 'solid' | 'tint',
  disabled?: boolean,
  className?: string
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
      className={`group relative flex items-center justify-center transition-all duration-200 active:scale-90 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
  const [isRecording, setIsRecording] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // 初始化加载，如果本地存储为空，则填充 Mock 数据
  useEffect(() => {
    const saved = localStorage.getItem('lumina_fragments');
    if (saved && JSON.parse(saved).length > 0) {
      setFragments(JSON.parse(saved));
    } else {
      setFragments(INITIAL_MOCK_DATA);
    }
  }, []);

  useEffect(() => {
    if (fragments.length > 0) {
      localStorage.setItem('lumina_fragments', JSON.stringify(fragments));
    }
  }, [fragments]);

  const addFragment = (content: string = inputValue) => {
    if (!content.trim()) return;
    const newFragment: Fragment = {
      id: Date.now().toString(),
      content: content,
      createdAt: Date.now(),
      tags: [],
      type: 'fragment',
      status: 'pending'
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

  const simulateRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const fakeVoiceResult = "我想在下周开始学习 WebGL，并将它应用在 Lumina 的画布可视化中。";
      addFragment(fakeVoiceResult);
    }, 2500);
  };

  return (
    <div className="flex h-screen bg-[#F4F4F7] text-[#121212] overflow-hidden p-4 gap-4">
      
      {/* 侧边栏导航 */}
      <nav className="w-[58px] bg-white rounded-[24px] shadow-lovart-md border border-white flex flex-col items-center py-5 z-20 flex-shrink-0 self-center h-fit">
        <div className="flex flex-col gap-2.5">
          <IconButton size="md" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21l-9-9 9-9 9 9-9 9z" /></svg>} label="灵感流" active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} tooltipPos="right" />
          <IconButton size="md" icon={<ListIcon />} label="规划/待办" active={currentView === AppView.PLANNING} onClick={handleOrganize} tooltipPos="right" />
          <IconButton size="md" icon={<BrainIcon />} label="创意工坊" active={currentView === AppView.BRAINSTORM} tooltipPos="right" />
          <IconButton size="md" icon={<CalendarIcon />} label="深度复盘" active={currentView === AppView.REVIEW} onClick={handleReview} tooltipPos="right" />
          <div className="w-6 h-[1px] bg-slate-50 my-1 self-center" />
          <IconButton size="md" icon={<ShareIcon />} label="导出" tooltipPos="right" />
        </div>
      </nav>

      {/* 主画布区 */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* 悬浮顶栏 */}
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

        {/* 画布核心内容 */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-12 pt-24 pb-48">
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center animate-bounce">
                      <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-blue-400/20 blur-xl rounded-full animate-pulse" />
                </div>
                <p className="text-xs font-black text-slate-400 tracking-widest uppercase">AI Architecting...</p>
            </div>
          ) : currentView === AppView.FEED ? (
            <div className="max-w-3xl mx-auto space-y-12">
              {fragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 opacity-5 select-none grayscale scale-110">
                   <SparklesIcon className="w-14 h-14 mb-4" />
                   <p className="text-[9px] font-black tracking-[0.4em] uppercase">Ready for your ideas</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {fragments.map((f, i) => (
                    <CanvasCard 
                      key={f.id} 
                      fragment={f} 
                      onDelete={() => deleteFragment(f.id)} 
                      onToggleTodo={() => toggleTodo(f.id)} 
                      onBrainstorm={() => handleBrainstorm(f.content)} 
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
                {currentView === AppView.PLANNING && aiResult && (
                    <div className="grid grid-cols-2 gap-6 h-full">
                        <div className="col-span-2 bg-white/60 p-8 rounded-[32px] border border-white mb-2">
                             <h2 className="text-2xl font-black mb-2">规划摘要</h2>
                             <p className="text-slate-500 font-bold leading-relaxed">{aiResult.summary}</p>
                        </div>
                        <QuadrantBox title="重要 & 紧急" color="red" items={aiResult.actionItems?.slice(0, 3)} />
                        <QuadrantBox title="重要 & 长远" color="blue" items={aiResult.themes} />
                        <QuadrantBox title="琐碎 & 待办" color="zinc" items={aiResult.opportunities?.slice(0, 3)} />
                        <QuadrantBox title="创意 & 备忘" color="orange" items={aiResult.opportunities?.slice(3, 6)} />
                    </div>
                )}
                {currentView === AppView.REVIEW && aiResult && (
                    <div className="bg-white p-16 rounded-[48px] shadow-lovart-lg border border-white font-serif max-w-2xl mx-auto">
                        <div className="border-b-4 border-black pb-4 mb-8">
                            <span className="text-[10px] font-black font-sans tracking-[0.4em] uppercase">Weekly Digest</span>
                            <h2 className="text-4xl font-black font-sans leading-tight mt-1">深度复盘摘要报告</h2>
                        </div>
                        <div className="prose prose-lg prose-slate font-bold text-slate-700 leading-loose whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left">
                            {aiResult}
                        </div>
                        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center font-sans">
                            <span className="text-[10px] font-black text-slate-300">© LUMINA AI SYSTEM</span>
                            <IconButton icon={<ShareIcon />} label="分享导出" size="sm" variant="tint" />
                        </div>
                    </div>
                )}
                {currentView === AppView.BRAINSTORM && aiResult && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200"><SparklesIcon className="w-5 h-5 text-white" /></div>
                            <h2 className="text-2xl font-black">"{aiResult.idea}" 的灵感发散</h2>
                        </div>
                        <div className="grid gap-4">
                            {aiResult.storm?.map((s: any, i: number) => (
                                <div key={i} className="p-6 bg-white rounded-[28px] border border-slate-50 hover:border-blue-100 hover:shadow-lovart-md transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-black text-lg text-black group-hover:text-blue-600 transition-colors">{s.concept}</h4>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${s.complexity === 'High' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>{s.complexity}</span>
                                    </div>
                                    <p className="text-[14px] font-bold text-slate-400 leading-relaxed">{s.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-center mt-12">
                   <button 
                    onClick={() => setCurrentView(AppView.FEED)}
                    className="px-8 py-3 bg-black text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    返回主画布
                  </button>
                </div>
            </div>
          )}
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
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFragment()}
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
                onClick={simulateRecording}
              />
              <IconButton icon={<SendIcon />} label="提交记录" variant="solid" size="md" onClick={() => addFragment()} />
            </div>
          </div>
        </div>
      </main>

      {/* 右侧 AI 助手面板 */}
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
             <p className="text-slate-400 font-bold text-sm tracking-tight leading-snug">正在分析您的碎片记录，准备提供今日洞察。</p>
          </div>

          <div className="space-y-4 mb-8">
             <PromptCard 
               title="AI 自动化规划" 
               subtitle="将散落的想法一键转化为结构化任务看板。" 
               onClick={handleOrganize}
               images={[
                 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=120&h=180&fit=crop',
                 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=120&h=180&fit=crop'
               ]}
             />
             <PromptCard 
               title="生成深度周报" 
               subtitle="深度回顾过去 7 天的思维轨迹，寻找成长亮点。" 
               onClick={handleReview}
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

        {/* AI 输入区 */}
        <div className="p-4 border-t border-slate-50 flex-shrink-0">
          <div className="bg-[#FBFBFC] rounded-[22px] p-4 border border-slate-100 transition-all focus-within:shadow-md focus-within:border-slate-200">
             <textarea 
               value={assistantInput}
               onChange={(e) => setAssistantInput(e.target.value)}
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

// --- 精致卡片组件 ---

const QuadrantBox = ({ title, color, items }: { title: string, color: 'red'|'blue'|'zinc'|'orange', items: any[] }) => {
    const colors = {
        red: 'bg-red-50/50 border-red-100 text-red-600',
        blue: 'bg-blue-50/50 border-blue-100 text-blue-600',
        zinc: 'bg-slate-50/50 border-slate-200 text-slate-600',
        orange: 'bg-orange-50/50 border-orange-100 text-orange-600'
    };
    return (
        <div className={`p-6 rounded-[28px] border-2 ${colors[color]} flex flex-col min-h-[220px]`}>
            <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 opacity-70">{title}</h3>
            <div className="flex-1 space-y-2">
                {items?.map((item, i) => (
                    <div key={i} className="p-3 bg-white/80 rounded-xl text-[13px] font-bold shadow-sm border border-white/50">{item}</div>
                ))}
            </div>
        </div>
    );
};

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
  <div className={`group bg-white p-8 rounded-[40px] border transition-all duration-500 relative ${fragment.type === 'todo' ? 'border-blue-50 shadow-lovart-sm ring-1 ring-blue-50' : 'border-white shadow-lovart-md hover:shadow-lovart-lg'}`}>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
              {fragment.type === 'todo' && (
                  <div className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded">TODO</div>
              )}
              <div className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-[0.1em] rounded">
                Captured at {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
             <IconButton icon={<BrainIcon />} label="发散" size="sm" onClick={onBrainstorm} />
             <IconButton icon={<PlusIcon />} label="移除" size="sm" onClick={onDelete} />
          </div>
      </div>
      <p className={`text-black leading-relaxed font-bold text-[1.25rem] tracking-tight mb-8 ${fragment.type === 'todo' && fragment.status === 'completed' ? 'line-through opacity-25' : ''}`}>
        {fragment.content}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <button 
              onClick={onToggleTodo}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${fragment.type === 'todo' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
            >
                {fragment.type === 'todo' ? 'Mark Completed' : '+ Convert to To-Do'}
            </button>
        </div>
        <div className="flex -space-x-1.5">
           <div className="w-5 h-5 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-purple-600" title="AI Insight Generated">✨</div>
           {fragment.type === 'todo' && <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">L</div>}
        </div>
      </div>
    </div>
  </div>
);

export default App;
