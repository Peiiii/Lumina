
import React from 'react';
import { useFragmentsStore } from '../../stores/fragmentsStore';
import { CanvasCard } from './CanvasCard';
import { SparklesIcon } from '../Icons';

export const FeedView = () => {
  const { fragments } = useFragmentsStore();
  return (
    <div className={`max-w-3xl mx-auto w-full ${fragments.length > 0 ? 'pb-48 space-y-12' : 'h-full flex items-center justify-center'}`}>
      {fragments.length === 0 ? (
        <div className="flex flex-col items-center justify-center opacity-5 select-none grayscale scale-110">
           <SparklesIcon className="w-14 h-14 mb-4" />
           <p className="text-[9px] font-black tracking-[0.4em] uppercase">Ready for your ideas</p>
        </div>
      ) : (
        <div className="grid gap-8 w-full">
          {fragments.map((f) => (
            <CanvasCard key={f.id} fragment={f} />
          ))}
        </div>
      )}
    </div>
  );
};
