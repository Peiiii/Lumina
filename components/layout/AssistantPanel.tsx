
import React, { useRef, useEffect, useState } from 'react';
import { AppView, AiMode } from '../../types';
import { usePresenter } from '../../context/LuminaContext';
import { useAppStore } from '../../stores/appStore';
import { useAiStore } from '../../stores/aiStore';
import { IconButton } from '../ui/Button';
import { PromptCard } from '../ui/Card';
import { Markdown } from '../ui/Markdown';
import { SparklesIcon, TrashIcon, ShareIcon, SendIcon } from '../Icons';

export const AssistantPanel: React.FC = () => {
  const presenter = usePresenter();
  const { assistantInput } = useAppStore();
  const { planningData, reviewData, chatHistory, isChatLoading, currentMode } = useAiStore();
  const [showModeMenu, setShowModeMenu] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  const ModeToggle = () => (
    <div className="relative">
      <button 
        onClick={() => setShowModeMenu(!showModeMenu)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-slate-50 transition-colors group"
      >
        <div className={`w-2 h-2 rounded-full animate-pulse ${currentMode === AiMode.AGENT ? 'bg-green-500' : 'bg-blue-500'}`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 transition-colors group-hover:text-black">
          {currentMode === AiMode.AGENT ? 'Agent' : 'Ask'}
        </span>
        <svg className={`w-2 h-2 text-slate-300 transition-transform ${showModeMenu ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M19 9l-7 7-7-7" /></svg>
      </button>

      {showModeMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowModeMenu(false)} />
          <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-lovart-lg border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { presenter.ai.setMode(AiMode.AGENT); setShowModeMenu(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${currentMode === AiMode.AGENT ? 'bg-black text-white' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <SparklesIcon className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tight">Agent</span>
            </button>
            <button 
              onClick={() => { presenter.ai.setMode(AiMode.ASK); setShowModeMenu(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left mt-0.5 transition-all ${currentMode === AiMode.ASK ? 'bg-black text-white' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span className="text-[10px] font-black uppercase tracking-tight">Ask</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <aside className="w-[340px] bg-white rounded-[28px] shadow-lovart-md border border-white flex flex-col z-30 flex-shrink-0 overflow-hidden">
      <header className="h-[60px] flex items-center justify-between px-4 gap-0.5 flex-shrink-0 border-b border-slate-50/50">
         <ModeToggle />
         <div className="flex items-center">
           <IconButton icon={<TrashIcon />} label="清空对话" size="sm" onClick={() => presenter.ai.clearChat()} tooltipPos="bottom" />
           <IconButton icon={<ShareIcon />} label="协作中心" size="sm" tooltipPos="bottom" />
         </div>
      </header>

      <div ref={chatScrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6">
        {chatHistory.length === 0 ? (
          <>
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="inline-flex items-center gap-2 px-2 py-1 bg-black text-white rounded-full mb-4">
                  {currentMode === AiMode.AGENT ? <SparklesIcon className="w-3 h-3" /> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                  <span className="text-[8px] font-black uppercase tracking-widest">{currentMode === AiMode.AGENT ? 'Agent 模式已就绪' : 'Ask 模式已就绪'}</span>
               </div>
               <h1 className="text-[20px] font-black text-black tracking-tight mb-1 leading-tight">Lumina 助手</h1>
               <p className="text-slate-400 font-bold text-sm tracking-tight leading-snug">
                 {currentMode === AiMode.AGENT 
                   ? "Agent 模式：实时感知你的画布，协助整理与规划。" 
                   : "Ask 模式：通用知识百科，随时为你解惑。"}
               </p>
            </div>

            <div className="space-y-4 mb-8">
               <PromptCard 
                 title="AI 自动化规划" 
                 subtitle="深度分析碎片记录，一键生成任务四象限看板。" 
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
                 title="生成复盘报告" 
                 subtitle="回顾最近的思维轨迹，提炼成长亮点与建议。" 
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

            <div className="p-4 bg-slate-50 rounded-2xl border border-white">
               <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">今日活跃度</span>
                  <span className="text-[9px] font-black text-black">86%</span>
               </div>
               <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-black w-[86%] rounded-full" />
               </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-[14px] ${
                  msg.role === 'user' 
                    ? 'bg-black text-white rounded-br-none' 
                    : 'bg-[#F4F4F7] text-slate-700 rounded-bl-none border border-white shadow-lovart-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="text-[13px] font-bold leading-relaxed">{msg.content}</div>
                  ) : (
                    <Markdown content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-[#F4F4F7] border border-white shadow-lovart-sm px-4 py-3 rounded-[14px] rounded-bl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-50 flex-shrink-0 bg-white">
        <div className="bg-[#FBFBFC] rounded-[22px] p-4 border border-slate-100 transition-all focus-within:shadow-md focus-within:border-slate-200">
           <textarea 
             value={assistantInput}
             onChange={(e) => presenter.app.setAssistantInput(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 presenter.ai.sendChatMessage();
               }
             }}
             placeholder={currentMode === AiMode.AGENT ? "基于画布询问 AI..." : "向 AI 提问任何事..."}
             disabled={isChatLoading}
             className="w-full bg-transparent border-none focus:outline-none resize-none h-16 text-[13px] font-semibold text-black placeholder:text-slate-300 leading-snug mb-2 scrollbar-hide disabled:opacity-50"
           />
           <div className="flex items-center justify-between">
              <IconButton icon={<SparklesIcon />} label="灵感激发" size="sm" variant="tint" tooltipPos="top" disabled={isChatLoading} />
              <IconButton 
                icon={<SendIcon />} 
                label="发送" 
                variant="solid" 
                size="sm" 
                isRound
                disabled={!assistantInput.trim() || isChatLoading} 
                onClick={() => presenter.ai.sendChatMessage()} 
              />
           </div>
        </div>
      </div>
    </aside>
  );
};
