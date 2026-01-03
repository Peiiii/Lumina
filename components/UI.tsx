
import React from 'react';
import { SparklesIcon } from './Icons';

type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

export const IconButton = ({ 
  icon, 
  onClick, 
  label, 
  active = false, 
  tooltipPos = 'top',
  size = 'md',
  variant = 'ghost',
  disabled = false,
  className = ""
}: { 
  icon: React.ReactNode, 
  onClick?: () => void, 
  label: string, 
  active?: boolean,
  tooltipPos?: TooltipPos,
  size?: 'sm' | 'md' | 'lg',
  variant?: 'ghost' | 'solid' | 'tint',
  disabled?: boolean,
  className?: string
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg p-1',
    md: 'w-9 h-9 rounded-xl p-2',
    lg: 'w-11 h-11 rounded-2xl p-2.5'
  };

  const variantClasses = {
    ghost: active ? 'bg-slate-100 text-black shadow-inner' : 'text-slate-400 hover:bg-slate-100/80 hover:text-black',
    solid: 'bg-black text-white shadow-md hover:bg-zinc-800 disabled:bg-slate-200',
    tint: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
  };

  // 基础样式：移除了会冲突的 translate-x-0
  const tooltipBase = "absolute px-2.5 py-1.5 bg-[#121212] text-white text-[11px] font-bold rounded-xl opacity-0 scale-90 pointer-events-none transition-all duration-200 z-[100] whitespace-nowrap shadow-2xl group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100";
  
  // 核心修复：在 hover 状态下显式保留居中偏移量 (-translate-x-1/2 或 -translate-y-1/2)
  const posMap = {
    // 顶部：水平居中。初始状态稍微往下靠，hover 时回到标准位置
    top: `${tooltipBase} bottom-full left-1/2 -translate-x-1/2 translate-y-1 mb-2.5 group-hover/tooltip:translate-y-0`,
    // 底部：水平居中。初始状态稍微往上靠，hover 时回到标准位置
    bottom: `${tooltipBase} top-full left-1/2 -translate-x-1/2 -translate-y-1 mt-2.5 group-hover/tooltip:translate-y-0`,
    // 左侧：垂直居中。初始状态稍微往右靠，hover 时回到标准位置
    left: `${tooltipBase} right-full top-1/2 -translate-y-1/2 translate-x-1 mr-2.5 group-hover/tooltip:translate-x-0`,
    // 右侧：垂直居中。初始状态稍微往左靠，hover 时回到标准位置
    right: `${tooltipBase} left-full top-1/2 -translate-y-1/2 -translate-x-1 ml-2.5 group-hover/tooltip:translate-x-0`
  };

  const arrowBase = "absolute w-2 h-2 bg-[#121212] rotate-45 rounded-[1px]";
  const arrowPos = {
    top: `${arrowBase} -bottom-1 left-1/2 -translate-x-1/2`,
    bottom: `${arrowBase} -top-1 left-1/2 -translate-x-1/2`,
    left: `${arrowBase} -right-1 top-1/2 -translate-y-1/2`,
    right: `${arrowBase} -left-1 top-1/2 -translate-y-1/2`
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group/tooltip relative flex items-center justify-center transition-all duration-200 active:scale-90 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-full h-full stroke-[2]' })}
      <div className={posMap[tooltipPos]}>
        {label}
        <div className={arrowPos[tooltipPos]} />
      </div>
    </button>
  );
};

export const ManualTriggerPlaceholder = ({ icon, title, description, onTrigger, buttonText }: { icon: React.ReactNode, title: string, description: string, onTrigger: () => void, buttonText: string }) => (
    <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-slate-300 shadow-lovart-md mb-8 border border-white">
            {icon}
        </div>
        <h2 className="text-2xl font-black mb-3 tracking-tight">{title}</h2>
        <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10">{description}</p>
        <button 
            onClick={onTrigger}
            className="flex items-center gap-3 px-10 py-4 bg-black text-white rounded-full font-black text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 group"
        >
            <SparklesIcon className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
            {buttonText}
        </button>
    </div>
);

export const QuadrantBox = ({ title, color, items }: { title: string, color: 'red'|'blue'|'zinc'|'orange', items: any[] }) => {
    const colors = {
        red: 'bg-red-50/50 border-red-100 text-red-600',
        blue: 'bg-blue-50/50 border-blue-100 text-blue-600',
        zinc: 'bg-slate-50/50 border-slate-200 text-slate-600',
        orange: 'bg-orange-50/50 border-orange-100 text-orange-600'
    };
    return (
        <div className={`p-6 rounded-[28px] border-2 ${colors[color]} flex flex-col min-h-[220px]`}>
            <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 opacity-70">{title}</h3>
            <div className="flex-1 space-y-2">
                {items?.map((item, i) => (
                    <div key={i} className="p-3 bg-white/80 rounded-xl text-[13px] font-bold shadow-sm border border-white/50">{item}</div>
                ))}
            </div>
        </div>
    );
};

export const PromptCard = ({ title, subtitle, images, onClick }: { title: string, subtitle: string, images: string[], onClick?: () => void }) => (
  <div 
    onClick={onClick} 
    className="bg-[#F8F9FA] p-4 pr-1.5 rounded-[20px] flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-lovart-md border border-transparent hover:border-slate-100 transition-all h-[96px]"
  >
    <div className="flex-1 pr-2">
      <h4 className="text-[12.5px] font-black text-black mb-0.5 group-hover:text-blue-600 tracking-tight">{title}</h4>
      <p className="text-slate-400 text-[9.5px] font-bold leading-tight line-clamp-2">{subtitle}</p>
    </div>
    <div className="flex -space-x-6 relative pr-3">
      {images.map((url, i) => (
        <div 
          key={i} 
          className={`w-11 h-15 rounded-lg overflow-hidden border-2 border-white shadow-lovart-sm transition-all duration-300 transform origin-bottom-right ${i === 0 ? 'rotate-[12deg] group-hover:rotate-0' : 'rotate-[-4deg] group-hover:rotate-0 scale-95 translate-x-1.5'}`} 
          style={{zIndex: images.length - i}}
        >
          <img src={url} alt="card" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
);
