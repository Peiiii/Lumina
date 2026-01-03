
import React from 'react';
import { useAiStore } from '../../stores/aiStore';
import { usePresenter } from '../../context/LuminaContext';
import { IconButton, ManualTriggerPlaceholder, ViewContainer } from '../UI';
import { CalendarIcon, SparklesIcon, ShareIcon } from '../Icons';

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
    <ViewContainer maxWidth="4xl" className="pb-48">
        <div className="bg-white p-16 rounded-[48px] shadow-lovart-lg border border-white font-serif relative animate-in zoom-in-95 duration-700">
          <div className="absolute top-8 right-8">
              <IconButton icon={<SparklesIcon />} label="刷新复盘" variant="ghost" onClick={presenter.ai.triggerReview} />
          </div>
          <div className="border-b-4 border-black pb-4 mb-8">
              <span className="text-[10px] font-black font-sans tracking-[0.4em] uppercase">每周精选</span>
              <h2 className="text-4xl font-black font-sans leading-tight mt-1">深度复盘摘要报告</h2>
          </div>
          <div className="prose prose-lg prose-slate font-bold text-slate-700 leading-loose whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left">
              {reviewData}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center font-sans">
              <span className="text-[10px] font-black text-slate-300">© LUMINA 智能系统</span>
              <IconButton icon={<ShareIcon />} label="分享导出" size="sm" variant="tint" />
          </div>
        </div>
    </ViewContainer>
  );
};
