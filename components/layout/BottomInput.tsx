
import React from 'react';
import { usePresenter } from '../../context/LuminaContext';
import { useAppStore } from '../../stores/appStore';
import { IconButton } from '../ui/Button';
import { SendIcon } from '../Icons';

export const BottomInput: React.FC = () => {
  const presenter = usePresenter();
  const { isRecording, inputValue } = useAppStore();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-none">
      <div className={`bg-white/95 backdrop-blur-2xl p-2.5 pl-7 rounded-full shadow-lovart-lg flex items-center gap-4 border border-white pointer-events-auto transition-all ${isRecording ? 'ring-4 ring-red-400/20' : ''}`}>
        {isRecording ? (
          <div className="flex-1 flex items-center gap-2">
             <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-1 bg-red-400 rounded-full animate-wave" style={{height: `${10 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s`}} />
                ))}
             </div>
             <span className="text-xs font-black text-red-500 tracking-widest uppercase ml-2">正在录音...</span>
          </div>
        ) : (
          <input 
            value={inputValue}
            onChange={(e) => presenter.app.setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && inputValue.trim() && presenter.fragments.addFragment()}
            placeholder="捕捉灵光一闪，或点击麦克风说出想法..."
            className="flex-1 bg-transparent border-none focus:outline-none text-[14px] font-bold text-black py-2 placeholder:text-slate-300"
          />
        )}
        <div className="flex items-center gap-1">
          <IconButton 
            icon={isRecording ? <div className="w-2 h-2 bg-white rounded-sm" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><path d="M12 19v4m-4 0h8"/></svg>} 
            label={isRecording ? "停止录音" : "语音输入"} 
            variant={isRecording ? "solid" : "ghost"}
            className={isRecording ? "bg-red-500 hover:bg-red-600 text-white" : ""}
            size="md" 
            isRound
            onClick={presenter.fragments.simulateRecording}
          />
          <IconButton 
            icon={<SendIcon />} 
            label="提交记录" 
            variant="solid" 
            size="md" 
            isRound
            disabled={!inputValue.trim()} 
            onClick={() => presenter.fragments.addFragment()} 
          />
        </div>
      </div>
    </div>
  );
};
