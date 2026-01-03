
import React from 'react';
import { useAiStore } from '../../stores/aiStore';
import { usePresenter } from '../../context/LuminaContext';
import { IconButton, ManualTriggerPlaceholder, QuadrantBox } from '../UI';
import { ListIcon, SparklesIcon } from '../Icons';

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
      <QuadrantBox title="琐碎 & 待办" color="zinc" items={planningData.actionItems?.slice(3, 6)} />
      <QuadrantBox title="创意 & 备忘" color="orange" items={planningData.opportunities?.slice(0, 3)} />
    </div>
  );
};
