
import React from 'react';
import { AppView } from '../../types';
import { useAppStore } from '../../stores/appStore';
import { IconButton } from '../ui/Button';
import { SearchIcon } from '../Icons';

export const CanvasHeader: React.FC = () => {
  const { currentView } = useAppStore();

  const getTitle = () => {
    switch (currentView) {
      case AppView.FEED: return '灵感流';
      case AppView.PLANNING: return '规划看板';
      case AppView.REVIEW: return '深度复盘';
      case AppView.BRAINSTORM: return '创意中心';
      default: return 'Lumina';
    }
  };

  return (
    <header className="absolute top-4 left-0 right-0 flex justify-between items-center pointer-events-none z-20 px-4">
      <div className="bg-white/95 backdrop-blur-xl px-2.5 py-1 rounded-[14px] shadow-lovart-sm border border-white/50 pointer-events-auto flex items-center gap-2.5">
         <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white font-black text-[8px]">LU</div>
         <div className="flex items-center gap-1 cursor-pointer group">
            <span className="text-[12px] font-bold text-slate-800 tracking-tight">
                {getTitle()}
            </span>
            <svg className="w-2 h-2 text-slate-300 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M19 9l-7 7-7-7" /></svg>
         </div>
      </div>
      <div className="bg-white/95 backdrop-blur-xl px-3 py-1 rounded-[14px] shadow-lovart-sm border border-white/50 pointer-events-auto flex items-center gap-3">
         <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">已同步</span>
         <IconButton size="sm" icon={<SearchIcon />} label="全局检索" tooltipPos="bottom" />
      </div>
    </header>
  );
};
