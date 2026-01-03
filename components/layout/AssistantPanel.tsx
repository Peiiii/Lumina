
import React, { useRef, useEffect } from 'react';
import { AppView } from '../../types';
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
  const { planningData, reviewData, chatHistory, isChatLoading } = useAiStore();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  return (
    <aside className="w-[340px] bg-white rounded-[28px] shadow-lovart-md border border-white flex flex-col z-30 flex-shrink-0 overflow-hidden">
      <header className="h-[60px] flex items-center justify-between px-4 gap-0.5 flex-shrink-0 border-b border-slate-50/50">
         <div className="flex items-center gap-1">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Agent Online</span>
         </div>
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
                  <SparklesIcon className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">智能助手已就绪</span>
               </div>
               <h1 className="text-[20px] font-black text-black tracking-tight mb-1 leading-tight">Lumina 助手</h1>
               <p className="text-slate-400 font-bold text-sm tracking-tight leading-snug">对话 AI，整理你的混乱思绪，或手动触发深度整理。</p>
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
             placeholder="对话 AI，整理你的混乱思绪..."
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
