
import React from 'react';
import { usePresenter } from '../../context/LuminaContext';
import { Fragment } from '../../types';
import { IconButton } from '../UI';
import { BrainIcon, TrashIcon } from '../Icons';

export const CanvasCard: React.FC<{ fragment: Fragment }> = ({ fragment }) => {
  const presenter = usePresenter();
  
  return (
    <div className={`group bg-white p-8 rounded-[40px] border transition-all duration-500 relative ${fragment.type === 'todo' ? 'border-blue-50 shadow-lovart-sm ring-1 ring-blue-50' : 'border-white shadow-lovart-md hover:shadow-lovart-lg'}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
                {fragment.type === 'todo' && (
                    <div className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded">TODO</div>
                )}
                <div className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-[0.1em] rounded">
                  Captured at {new Date(fragment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
               <IconButton icon={<BrainIcon />} label="发散" size="sm" onClick={() => presenter.ai.handleBrainstorm(fragment.content)} tooltipPos="top" />
               <IconButton 
                  icon={<TrashIcon />} 
                  label="移除" 
                  size="sm" 
                  onClick={() => presenter.fragments.deleteFragment(fragment.id)} 
                  tooltipPos="top"
                  className="hover:bg-red-50 hover:text-red-500"
               />
            </div>
        </div>
        <p className={`text-black leading-relaxed font-bold text-[1.25rem] tracking-tight mb-8 ${fragment.type === 'todo' && fragment.status === 'completed' ? 'line-through opacity-25' : ''}`}>
          {fragment.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <button 
                onClick={() => presenter.fragments.toggleTodo(fragment.id)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${fragment.type === 'todo' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                  {fragment.type === 'todo' ? 'Mark Completed' : '+ Convert to To-Do'}
              </button>
          </div>
          <div className="flex -space-x-1.5">
             <div className="w-5 h-5 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-purple-600" title="AI Insight Generated">✨</div>
             {fragment.type === 'todo' && <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">L</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
