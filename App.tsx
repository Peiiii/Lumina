
import React, { useState, useEffect } from 'react';
import { Fragment, AppView } from './types';
import { brainstormFromIdea, organizeFragments, generateReview } from './services/geminiService';
import { PlusIcon, SparklesIcon, BrainIcon, ListIcon, CalendarIcon } from './components/Icons';

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
      case AppView.PLANNING: return '个人规划与目标';
      case AppView.BRAINSTORM: return '头脑风暴与灵感';
      case AppView.REVIEW: return 'AI 复盘与洞察';
      default: return '未命名';
    }
  };

  return (
    <div className="flex h-screen bg-[#F6F8FA] text-[#1E293B]">
      {/* 侧边导航栏 - 深度对齐参考图样式 */}
      <nav className="w-20 md:w-24 bg-white border-r border-slate-100 flex flex-col items-center py-10 z-20">
        <div className="mb-14">
          <div className="w-12 h-12 bg-[#121212] rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 transition-spatial hover:scale-105 active:scale-95">
             <SparklesIcon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-10">
          <SpatialNavBtn active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} icon={<ListIcon className="w-6 h-6" />} label="碎片" />
          <SpatialNavBtn active={currentView === AppView.PLANNING} onClick={() => setCurrentView(AppView.PLANNING)} icon={<CalendarIcon className="w-6 h-6" />} label="规划" />
          <SpatialNavBtn active={currentView === AppView.BRAINSTORM} onClick={() => setCurrentView(AppView.BRAINSTORM)} icon={<BrainIcon className="w-6 h-6" />} label="灵感" />
          <SpatialNavBtn active={currentView === AppView.REVIEW} onClick={() => setCurrentView(AppView.REVIEW)} icon={<SparklesIcon className="w-6 h-6" />} label="复盘" />
        </div>

        <div className="mt-auto group">
          <button 
            onClick={handleOrganize}
            className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-spatial shadow-sm group-hover:shadow-indigo-100"
          >
            <SparklesIcon className="w-6 h-6 transition-spatial group-hover:scale-110" />
          </button>
        </div>
      </nav>

      {/* 主工作区 */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* 玻璃拟态顶部栏 */}
        <header className="h-20 glass-panel flex items-center justify-between px-12 sticky top-0 z-10 border-b-0">
          <div className="flex flex-col">
             <h2 className="text-xl font-bold tracking-tight text-[#121212]">
               {getViewTitle()}
             </h2>
             <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <p className="text-[10px] text-slate-400 font-bold tracking-[0.1em] uppercase">Lumina AI Connected</p>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
             {isAiLoading && (
               <div className="flex items-center gap-3 bg-slate-900/5 px-5 py-2.5 rounded-2xl text-slate-700 text-xs font-bold animate-pulse border border-white">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                 AI 正在深度思考...
               </div>
             )}
             <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-2xl transition-spatial cursor-pointer border border-transparent hover:border-slate-100">
               <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-4 ring-slate-100/50">
                 W
               </div>
               <span className="text-sm font-bold text-slate-800">未命名</span>
             </div>
          </div>
        </header>

        {/* 动态内容区 */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-10 md:p-16 pb-40">
          {currentView === AppView.FEED && (
            <div className="max-w-6xl mx-auto">
              {fragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-1000">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-spatial flex items-center justify-center mb-8 border border-slate-50">
                    <ListIcon className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">捕捉你的第一个想法</h3>
                  <p className="text-slate-400 font-medium max-w-sm">
                    生活中的灵感转瞬即逝，在这里记录它们，AI 将为你编织智慧的网。
                  </p>
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
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {!aiResult ? (
                <div className="bg-white p-20 rounded-[3rem] shadow-spatial text-center border border-white">
                  <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-indigo-100/50">
                    <CalendarIcon className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">从混沌到秩序</h3>
                  <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                    点击下方按钮，Lumina 将分析你最近的所有记录，并生成一套可执行的个人目标与规划建议。
                  </p>
                  <button onClick={handleOrganize} className="px-10 py-5 bg-[#121212] text-white rounded-2xl font-bold shadow-2xl hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-spatial">
                    生成系统规划
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <AiSpatialSection title="核心主题" items={aiResult.themes} color="indigo" />
                  <AiSpatialSection title="待办任务" items={aiResult.actionItems} color="emerald" />
                  <AiSpatialSection title="潜在机遇" items={aiResult.opportunities} color="amber" />
                  <div className="col-span-full p-12 bg-white shadow-spatial rounded-[3rem] border border-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/40 rounded-full blur-3xl -mr-40 -mt-40 animate-pulse" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                       <SparklesIcon className="w-6 h-6 text-indigo-500" />
                       战略洞察总结
                    </h3>
                    <p className="text-slate-600 leading-loose text-xl font-medium tracking-tight">{aiResult.summary}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === AppView.BRAINSTORM && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {!aiResult?.length ? (
                <div className="text-center py-40">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                     <BrainIcon className="w-8 h-8 text-slate-300" />
                   </div>
                   <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">请从碎片列表选择一个想法开始头脑风暴</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {aiResult.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-spatial border border-white hover:border-indigo-100 transition-spatial group">
                      <div className="flex items-center gap-3 mb-6">
                         <span className={`px-5 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full border ${
                           item.complexity === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                           item.complexity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                         }`}>
                           {item.complexity === 'Low' ? '低难度' : item.complexity === 'Medium' ? '中等难度' : '挑战性'}
                         </span>
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-4">{item.concept}</h4>
                      <p className="text-slate-500 leading-loose text-lg font-medium">{item.reasoning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === AppView.REVIEW && (
             <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="bg-white p-16 rounded-[3.5rem] shadow-spatial border border-white relative overflow-hidden">
                 <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#EC4899] opacity-80" />
                 <div className="flex items-center justify-between mb-12">
                    <h3 className="text-3xl font-bold text-slate-900">AI 周期性复盘</h3>
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                       <SparklesIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                 </div>
                 {aiResult?.summary ? (
                   <div className="space-y-8">
                      {aiResult.summary.split('\n').filter(Boolean).map((para: string, i: number) => (
                        <p key={i} className="text-slate-600 text-xl leading-relaxed font-medium tracking-tight opacity-90">{para}</p>
                      ))}
                   </div>
                 ) : (
                    <div className="text-center py-10">
                       <button onClick={handleWeeklyReview} className="px-12 py-5 bg-[#121212] text-white rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition-spatial">
                         开始智能复盘
                       </button>
                    </div>
                 )}
               </div>
             </div>
          )}
        </div>

        {/* 浮动记录岛 - 完美契合参考图样式 */}
        {currentView === AppView.FEED && (
          <div className="absolute bottom-12 left-0 right-0 px-8 z-30 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-3xl p-4 pl-8 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] flex items-center gap-5 transition-spatial border border-white/60 focus-within:shadow-indigo-500/10 focus-within:ring-1 ring-slate-100">
                <input 
                  id="main-input"
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFragment()}
                  placeholder="有什么灵感闪现吗？直接输入..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 py-4 text-xl font-medium placeholder:text-slate-300"
                />
                <div className="flex items-center gap-3 pr-2">
                   {/* 工具按钮 - 仿参考图 */}
                   <div className="flex items-center gap-2 mr-2">
                      <ToolIconButton icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>} />
                      <ToolIconButton icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                   </div>
                   <button 
                    onClick={addFragment}
                    disabled={!inputValue.trim()}
                    className="w-14 h-14 bg-[#121212] disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl flex items-center justify-center transition-spatial hover:bg-slate-800 shadow-xl shadow-black/5 active:scale-90"
                  >
                    <PlusIcon className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// 工具组件

const ToolIconButton = ({ icon }: { icon: React.ReactNode }) => (
  <button className="p-2.5 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-spatial">
    {icon}
  </button>
);

const SpatialNavBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className="group relative flex flex-col items-center gap-3 transition-spatial"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-spatial ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-800'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-spatial ${active ? 'text-indigo-600 opacity-100 translate-y-0' : 'text-slate-300 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'}`}>
      {label}
    </span>
    {active && <div className="absolute -left-12 w-2 h-10 bg-indigo-600 rounded-full blur-[3px]" />}
  </button>
);

interface FragmentCardProps {
  fragment: Fragment;
  onDelete: (id: string) => void;
  onToggleTodo: () => void;
  onBrainstorm: () => void | Promise<void>;
}

const FragmentCard: React.FC<FragmentCardProps> = ({ fragment, onDelete, onToggleTodo, onBrainstorm }) => {
  const isTodo = fragment.content.toLowerCase().startsWith('todo:') || fragment.type === 'todo';
  const cleanContent = fragment.content.replace(/^todo:\s*/i, '');

  return (
    <div className="break-inside-avoid bg-white p-10 rounded-[2.5rem] shadow-spatial shadow-spatial-hover border border-white transition-spatial group">
      <div className="flex gap-6">
        {isTodo && (
          <button 
            onClick={onToggleTodo}
            className={`w-8 h-8 mt-1 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-spatial ${fragment.status === 'completed' ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'}`}
          >
            {fragment.status === 'completed' && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </button>
        )}
        <div className="flex-1">
          <p className={`text-slate-800 leading-relaxed whitespace-pre-wrap font-bold text-xl tracking-tight ${fragment.status === 'completed' ? 'opacity-30 line-through' : ''}`}>
            {cleanContent}
          </p>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-200">
                {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <div className="h-3 w-px bg-slate-100" />
               <span className="text-[10px] font-black tracking-widest text-slate-200 uppercase">
                 Fragment
               </span>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-spatial translate-x-2 group-hover:translate-x-0">
              <button onClick={onBrainstorm} className="p-3 hover:bg-indigo-50 text-indigo-300 hover:text-indigo-600 rounded-2xl transition-spatial" title="开启头脑风暴">
                <BrainIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(fragment.id)} className="p-3 hover:bg-rose-50 text-slate-200 hover:text-rose-500 rounded-2xl transition-spatial" title="删除记录">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AiSpatialSection = ({ title, items, color }: { title: string, items: string[], color: string }) => {
  const colorVariants: Record<string, string> = {
    indigo: 'bg-white text-slate-800 border-white',
    emerald: 'bg-white text-slate-800 border-white',
    amber: 'bg-white text-slate-800 border-white',
  };

  const dotColors: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className={`p-10 rounded-[3rem] border shadow-spatial bg-white transition-spatial hover:shadow-indigo-500/5 group`}>
      <h4 className="font-black text-[10px] tracking-[0.3em] uppercase mb-8 flex items-center gap-4 text-slate-300 group-hover:text-slate-500 transition-spatial">
        <div className={`w-2 h-2 rounded-full ${dotColors[color] || dotColors.indigo} shadow-lg shadow-current/20`} />
        {title}
      </h4>
      <ul className="space-y-5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4 text-sm font-bold leading-relaxed text-slate-600 hover:text-indigo-600 transition-colors cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-100 mt-2 flex-shrink-0 group-hover:bg-indigo-100 transition-colors" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
