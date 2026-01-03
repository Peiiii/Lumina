
import React from 'react';
import { useFragmentsStore } from '../stores/fragmentsStore';
import { useAiStore } from '../stores/aiStore';
import { usePresenter } from '../context/LuminaContext';
import { Fragment } from '../types';
import { IconButton, ManualTriggerPlaceholder, QuadrantBox } from './UI';
import { BrainIcon, TrashIcon, SparklesIcon, ListIcon, CalendarIcon, ShareIcon } from './Icons';

export const CanvasCard: React.FC<{ fragment: Fragment }> = ({ fragment }) => {
  const presenter = usePresenter();
  
  return (
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
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
               <IconButton icon={<BrainIcon />} label="发散" size="sm" onClick={() => presenter.ai.handleBrainstorm(fragment.content)} tooltipPos="top" />
               <IconButton 
                  icon={<TrashIcon />} 
                  label="移除" 
                  size="sm" 
                  onClick={() => presenter.fragments.deleteFragment(fragment.id)} 
                  tooltipPos="top"
                  className="hover:bg-red-50 hover:text-red-500"
               />
            </div>
        </div>
        <p className={`text-black leading-relaxed font-bold text-[1.25rem] tracking-tight mb-8 ${fragment.type === 'todo' && fragment.status === 'completed' ? 'line-through opacity-25' : ''}`}>
          {fragment.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <button 
                onClick={() => presenter.fragments.toggleTodo(fragment.id)}
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
};

export const FeedView = () => {
  const { fragments } = useFragmentsStore();
  return (
    <div className={`max-w-3xl mx-auto ${fragments.length > 0 ? 'pb-48 space-y-12' : 'h-full flex items-center'}`}>
      {fragments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-5 select-none grayscale scale-110">
           <SparklesIcon className="w-14 h-14 mb-4" />
           <p className="text-[9px] font-black tracking-[0.4em] uppercase">Ready for your ideas</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {fragments.map((f) => (
            <CanvasCard key={f.id} fragment={f} />
          ))}
        </div>
      )}
    </div>
  );
};

export const PlanningView = () => {
  const { planningData } = useAiStore();
  const presenter = usePresenter();
  
  if (!planningData) {
    return (
      <ManualTriggerPlaceholder 
        icon={<ListIcon className="w-12 h-12" />}
        title="结构化你的思绪"
        description="AI 将分析你所有的碎片记录，将其整理为四象限任务看板，帮助你清晰掌控全局进度。"
        onTrigger={presenter.ai.triggerOrganize}
        buttonText="开启 AI 组织规划"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6 pb-48 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="col-span-2 bg-white/60 p-8 rounded-[32px] border border-white mb-2 flex justify-between items-start">
           <div>
              <h2 className="text-2xl font-black mb-2">规划摘要</h2>
              <p className="text-slate-500 font-bold leading-relaxed">{planningData.summary}</p>
           </div>
           <IconButton icon={<SparklesIcon />} label="重新生成" variant="tint" onClick={presenter.ai.triggerOrganize} />
      </div>
      <QuadrantBox title="重要 & 紧急" color="red" items={planningData.actionItems?.slice(0, 3)} />
      <QuadrantBox title="重要 & 长远" color="blue" items={planningData.themes} />
      <QuadrantBox title="琐碎 & 待办" color="zinc" items={planningData.opportunities?.slice(0, 3)} />
      <QuadrantBox title="创意 & 备忘" color="orange" items={planningData.opportunities?.slice(3, 6)} />
    </div>
  );
};

export const ReviewView = () => {
  const { reviewData } = useAiStore();
  const presenter = usePresenter();

  if (!reviewData) {
    return (
      <ManualTriggerPlaceholder 
          icon={<CalendarIcon className="w-12 h-12" />}
          title="深度复盘总结"
          description="回顾最近的思维轨迹，AI 将为你提炼核心进展与接下来的行动建议。这不仅是总结，更是成长的反馈。"
          onTrigger={presenter.ai.triggerReview}
          buttonText="生成复盘报告"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-48">
        <div className="bg-white p-16 rounded-[48px] shadow-lovart-lg border border-white font-serif relative animate-in zoom-in-95 duration-700">
          <div className="absolute top-8 right-8">
              <IconButton icon={<SparklesIcon />} label="刷新复盘" variant="ghost" onClick={presenter.ai.triggerReview} />
          </div>
          <div className="border-b-4 border-black pb-4 mb-8">
              <span className="text-[10px] font-black font-sans tracking-[0.4em] uppercase">Weekly Digest</span>
              <h2 className="text-4xl font-black font-sans leading-tight mt-1">深度复盘摘要报告</h2>
          </div>
          <div className="prose prose-lg prose-slate font-bold text-slate-700 leading-loose whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left">
              {reviewData}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center font-sans">
              <span className="text-[10px] font-black text-slate-300">© LUMINA AI SYSTEM</span>
              <IconButton icon={<ShareIcon />} label="分享导出" size="sm" variant="tint" />
          </div>
        </div>
    </div>
  );
};

export const BrainstormView = () => {
  const { stormData } = useAiStore();
  const presenter = usePresenter();

  if (!stormData) {
    return (
      <ManualTriggerPlaceholder 
          icon={<BrainIcon className="w-12 h-12" />}
          title="创意工坊"
          description="在灵感流中选择一个特定想法点击“发散”图标，或在此开启全域创意风暴。"
          onTrigger={() => presenter.app.setCurrentView('feed' as any)}
          buttonText="去画布选择创意"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-48 animate-in slide-in-from-right-8 duration-500 flex flex-col items-center">
      <div className="flex flex-col items-center text-center gap-4 mb-12 max-w-3xl">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 rotate-3"><SparklesIcon className="w-6 h-6 text-white" /></div>
          <h2 className="text-3xl font-black leading-tight tracking-tight">"{stormData.idea}" 的灵感发散</h2>
      </div>
      <div className="grid gap-4 w-full max-w-2xl mx-auto">
          {stormData.storm?.map((s: any, i: number) => (
              <div key={i} className="p-8 bg-white rounded-[32px] border border-white shadow-lovart-md hover:shadow-lovart-lg hover:-translate-y-1 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-xl text-black group-hover:text-blue-600 transition-colors tracking-tight">{s.concept}</h4>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${s.complexity === 'High' ? 'bg-red-50 text-red-500' : s.complexity === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>{s.complexity}</span>
                  </div>
                  <p className="text-[15px] font-bold text-slate-400 leading-relaxed">{s.reasoning}</p>
              </div>
          ))}
      </div>
    </div>
  );
};
