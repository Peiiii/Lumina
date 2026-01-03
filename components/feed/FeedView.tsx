
import React from 'react';
import { useFragmentsStore } from '../../stores/fragmentsStore';
import { CanvasCard } from './CanvasCard';
import { SparklesIcon } from '../Icons';
import { ViewContainer } from '../UI';

export const FeedView = () => {
  const { fragments } = useFragmentsStore();
  return (
    <ViewContainer className={fragments.length > 0 ? 'pb-48 space-y-12' : 'h-full flex items-center justify-center'}>
      {fragments.length === 0 ? (
        <div className="flex flex-col items-center justify-center opacity-5 select-none grayscale scale-110 text-center">
           <SparklesIcon className="w-14 h-14 mb-4 mx-auto" />
           <p className="text-[9px] font-black tracking-[0.4em] uppercase">准备好捕捉你的灵感了</p>
        </div>
      ) : (
        <div className="grid gap-8 w-full">
          {fragments.map((f) => (
            <CanvasCard key={f.id} fragment={f} />
          ))}
        </div>
      )}
    </ViewContainer>
  );
};
