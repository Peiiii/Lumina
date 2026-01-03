
import React from 'react';
import { useAiStore } from '../../stores/aiStore';
import { usePresenter } from '../../context/LuminaContext';
import { ManualTriggerPlaceholder } from '../ui/Placeholder';
import { ViewContainer } from '../ui/Layout';
import { Badge } from '../ui/Badge';
import { BrainIcon, SparklesIcon } from '../Icons';
import { AppView } from '../../types';

export const BrainstormView = () => {
  const { stormData } = useAiStore();
  const presenter = usePresenter();

  if (!stormData) {
    return (
      <ManualTriggerPlaceholder 
          icon={<BrainIcon className="w-12 h-12" />}
          title="创意工坊"
          description="在灵感流中选择一个特定想法点击“发散”图标，或在此开启全域创意风暴。"
          onTrigger={() => presenter.app.setCurrentView(AppView.FEED)}
          buttonText="去画布选择创意"
      />
    );
  }

  return (
    <ViewContainer maxWidth="4xl" center className="pb-48 animate-in slide-in-from-right-8 duration-500">
      <div className="flex flex-col items-center text-center gap-4 mb-12 max-w-3xl">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 rotate-3">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-tight text-black">"{stormData.idea}" 的灵感发散</h2>
      </div>
      <div className="grid gap-4 w-full max-w-2xl">
          {stormData.storm?.map((s: any, i: number) => (
              <div key={i} className="p-8 bg-white rounded-[32px] border border-white shadow-lovart-md hover:shadow-lovart-lg hover:-translate-y-1 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-xl text-black group-hover:text-blue-600 transition-colors tracking-tight">{s.concept}</h4>
                      <Badge variant={s.complexity === 'High' ? 'red' : s.complexity === 'Medium' ? 'orange' : 'green'}>
                        {s.complexity}
                      </Badge>
                  </div>
                  <p className="text-[15px] font-bold text-slate-400 leading-relaxed">{s.reasoning}</p>
              </div>
          ))}
      </div>
    </ViewContainer>
  );
};
