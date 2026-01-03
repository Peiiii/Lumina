
import React from 'react';
import { Button } from './Button';
import { SparklesIcon } from '../Icons';

export const ManualTriggerPlaceholder = ({ icon, title, description, onTrigger, buttonText }: { icon: React.ReactNode, title: string, description: string, onTrigger: () => void, buttonText: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto min-h-[400px]">
        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-slate-300 shadow-lovart-md mb-8 border border-white">
            {icon}
        </div>
        <h2 className="text-2xl font-black mb-3 tracking-tight text-black">{title}</h2>
        <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10">{description}</p>
        <Button onClick={onTrigger} size="lg" icon={<SparklesIcon className="w-4 h-4 text-blue-400" />}>
          {buttonText}
        </Button>
    </div>
);
