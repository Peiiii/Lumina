
import React from 'react';
import { AppView } from '../../types';
import { usePresenter } from '../../context/LuminaContext';
import { useAppStore } from '../../stores/appStore';
import { IconButton } from '../ui/Button';
import { BrainIcon, ListIcon, CalendarIcon, ShareIcon } from '../Icons';

export const Sidebar: React.FC = () => {
  const presenter = usePresenter();
  const { currentView } = useAppStore();

  return (
    <nav className="w-[58px] bg-white rounded-[24px] shadow-lovart-md border border-white flex flex-col items-center py-5 z-20 flex-shrink-0 self-center h-fit">
      <div className="flex flex-col gap-2.5">
        <IconButton 
          size="md" 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21l-9-9 9-9 9 9-9 9z" /></svg>} 
          label="灵感流" 
          active={currentView === AppView.FEED} 
          onClick={() => presenter.app.setCurrentView(AppView.FEED)} 
          tooltipPos="right" 
        />
        <IconButton 
          size="md" 
          icon={<ListIcon />} 
          label="规划/待办" 
          active={currentView === AppView.PLANNING} 
          onClick={() => presenter.app.setCurrentView(AppView.PLANNING)} 
          tooltipPos="right" 
        />
        <IconButton 
          size="md" 
          icon={<BrainIcon />} 
          label="创意工坊" 
          active={currentView === AppView.BRAINSTORM} 
          onClick={() => presenter.app.setCurrentView(AppView.BRAINSTORM)} 
          tooltipPos="right" 
        />
        <IconButton 
          size="md" 
          icon={<CalendarIcon />} 
          label="深度复盘" 
          active={currentView === AppView.REVIEW} 
          onClick={() => presenter.app.setCurrentView(AppView.REVIEW)} 
          tooltipPos="right" 
        />
        <div className="w-6 h-[1px] bg-slate-50 my-1 self-center" />
        <IconButton size="md" icon={<ShareIcon />} label="导出分享" tooltipPos="right" />
      </div>
    </nav>
  );
};
