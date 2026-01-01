
import React, { useState, useEffect, useCallback } from 'react';
import { Fragment, AppView, NoteType } from './types';
import { brainstormFromIdea, organizeFragments, generateReview } from './services/geminiService';
import { PlusIcon, SparklesIcon, BrainIcon, ListIcon, CalendarIcon } from './components/Icons';

const App: React.FC = () => {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.FEED);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('lumina_fragments');
    if (saved) setFragments(JSON.parse(saved));
  }, []);

  // Save to local storage
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

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <nav className="w-full md:w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col items-center py-8">
        <div className="flex items-center gap-3 mb-12 px-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="hidden lg:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Lumina
          </h1>
        </div>

        <div className="flex-1 w-full px-3 flex flex-col gap-2">
          <NavBtn active={currentView === AppView.FEED} onClick={() => setCurrentView(AppView.FEED)} icon={<ListIcon className="w-5 h-5" />} label="Fragments" />
          <NavBtn active={currentView === AppView.PLANNING} onClick={() => setCurrentView(AppView.PLANNING)} icon={<CalendarIcon className="w-5 h-5" />} label="Planning" />
          <NavBtn active={currentView === AppView.BRAINSTORM} onClick={() => setCurrentView(AppView.BRAINSTORM)} icon={<BrainIcon className="w-5 h-5" />} label="Brainstorm" />
          <NavBtn active={currentView === AppView.REVIEW} onClick={() => setCurrentView(AppView.REVIEW)} icon={<SparklesIcon className="w-5 h-5" />} label="Review" />
        </div>

        <div className="w-full px-4 mt-auto">
          <button 
            onClick={handleOrganize}
            className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium group"
          >
            <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="hidden lg:block">AI Organize</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {currentView === AppView.FEED ? 'Fragment Feed' : currentView}
          </h2>
          <div className="flex gap-4">
             {isAiLoading && (
               <div className="flex items-center gap-2 text-indigo-600 text-sm animate-pulse">
                 <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                 Lumina AI is thinking...
               </div>
             )}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {currentView === AppView.FEED && (
            <div className="max-w-3xl mx-auto space-y-4">
              {fragments.length === 0 ? (
                <EmptyState onAdd={() => document.getElementById('main-input')?.focus()} />
              ) : (
                fragments.map(fragment => (
                  <FragmentCard 
                    key={fragment.id} 
                    fragment={fragment} 
                    onDelete={deleteFragment}
                    onToggleTodo={() => toggleTodo(fragment.id)}
                    onBrainstorm={() => handleBrainstorm(fragment.content)}
                  />
                ))
              )}
            </div>
          )}

          {currentView === AppView.PLANNING && (
            <div className="max-w-4xl mx-auto space-y-6">
              {!aiResult ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No analysis yet. Let Lumina organize your thoughts!</p>
                  <button onClick={handleOrganize} className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:shadow-indigo-200 transition-all">Generate Plan</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AiSection title="Main Themes" items={aiResult.themes} color="blue" />
                  <AiSection title="Action Items" items={aiResult.actionItems} color="green" />
                  <AiSection title="Opportunities" items={aiResult.opportunities} color="purple" />
                  <div className="col-span-1 md:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Synthesis</h3>
                    <p className="text-slate-600 leading-relaxed">{aiResult.summary}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === AppView.BRAINSTORM && (
            <div className="max-w-4xl mx-auto">
              {!aiResult?.length ? (
                <div className="text-center py-12">
                   <p className="text-slate-500">Select a fragment to brainstorm from or run a general session.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {aiResult.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                           item.complexity === 'Low' ? 'bg-green-100 text-green-700' : 
                           item.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                         }`}>
                           {item.complexity} Complexity
                         </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2">{item.concept}</h4>
                      <p className="text-slate-600">{item.reasoning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === AppView.REVIEW && (
             <div className="max-w-3xl mx-auto space-y-6">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                   <SparklesIcon className="w-8 h-8 text-indigo-600" />
                   <h3 className="text-2xl font-bold text-slate-900">AI Weekly Reflection</h3>
                 </div>
                 {aiResult?.summary ? (
                   <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed space-y-4">
                      {aiResult.summary.split('\n').map((para: string, i: number) => (
                        <p key={i}>{para}</p>
                      ))}
                   </div>
                 ) : (
                    <div className="text-center py-8">
                       <button onClick={handleWeeklyReview} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:-translate-y-1 transition-all">Generate Weekly Review</button>
                    </div>
                 )}
               </div>
             </div>
          )}
        </div>

        {/* Input Dock (Floating at the bottom) */}
        {currentView === AppView.FEED && (
          <div className="absolute bottom-8 left-0 right-0 px-4 pointer-events-none">
            <div className="max-w-2xl mx-auto pointer-events-auto">
              <div className="bg-white p-2 pl-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-2 group transition-all focus-within:ring-2 ring-indigo-500/20">
                <input 
                  id="main-input"
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFragment()}
                  placeholder="Record a thought, idea, or task..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 py-3"
                />
                <button 
                  onClick={addFragment}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 bg-indigo-600 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-all hover:bg-indigo-700 shadow-md"
                >
                  <PlusIcon className="w-6 h-6" />
                </button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">Press Enter to save • Your fragments are synced locally</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Sub-components

const NavBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
  >
    {icon}
    <span className="hidden lg:block font-medium">{label}</span>
  </button>
);

// Explicitly define props type and allow Promise return for onBrainstorm to fix type errors
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
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex gap-4">
        {isTodo && (
          <button 
            onClick={onToggleTodo}
            className={`w-6 h-6 mt-1 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${fragment.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}
          >
            {fragment.status === 'completed' && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </button>
        )}
        <div className="flex-1">
          <p className={`text-slate-800 leading-relaxed whitespace-pre-wrap ${fragment.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
            {cleanContent}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="hidden group-hover:flex items-center gap-2 ml-auto">
              <button onClick={onBrainstorm} className="p-1.5 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-lg transition-colors" title="Brainstorm">
                <BrainIcon className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(fragment.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Delete">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AiSection = ({ title, items, color }: { title: string, items: string[], color: 'blue' | 'green' | 'purple' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100'
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorMap[color]} h-full`}>
      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5" />
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-40 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <SparklesIcon className="w-10 h-10 text-slate-300" />
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">Clear your mind</h3>
    <p className="text-slate-500 max-w-xs mb-8">Start recording fragments of your day. Lumina will help you make sense of them later.</p>
    <button 
      onClick={onAdd}
      className="px-6 py-3 bg-white border border-slate-200 text-indigo-600 font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
    >
      Add your first thought
    </button>
  </div>
);

export default App;
