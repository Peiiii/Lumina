
import React from 'react';
import { SparklesIcon } from './Icons';

type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

// 基础按钮变体定义
type ButtonVariant = 'primary' | 'secondary' | 'tint' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = "", 
  disabled = false, 
  icon,
  loading = false
}) => {
  const baseStyles = "flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all duration-200 active:scale-95 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/5 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
    secondary: "bg-white text-black border border-slate-200 hover:border-black shadow-sm disabled:border-slate-100 disabled:text-slate-300",
    tint: "bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:bg-slate-50 disabled:text-slate-300",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-black disabled:text-slate-200",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-[9px] rounded-full",
    md: "px-6 py-2.5 text-[11px] rounded-full",
    lg: "px-10 py-4 text-[12px] rounded-full"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
};

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
    sm: 'w-7 h-7 rounded-lg p-1.5',
    md: 'w-9 h-9 rounded-xl p-2',
    lg: 'w-11 h-11 rounded-2xl p-2.5'
  };

  const variantClasses = {
    ghost: active ? 'bg-slate-100 text-black shadow-inner' : 'text-slate-400 hover:bg-slate-100/80 hover:text-black disabled:text-slate-200',
    solid: 'bg-black text-white shadow-md hover:bg-zinc-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none',
    tint: 'bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:bg-slate-50 disabled:text-slate-300'
  };

  const tooltipBase = "absolute px-2.5 py-1.5 bg-[#121212] text-white text-[11px] font-bold rounded-xl opacity-0 scale-90 pointer-events-none transition-all duration-200 z-[100] whitespace-nowrap shadow-2xl group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100";
  
  const posMap = {
    top: `${tooltipBase} bottom-full left-1/2 -translate-x-1/2 translate-y-1 mb-2.5 group-hover/tooltip:translate-y-0`,
    bottom: `${tooltipBase} top-full left-1/2 -translate-x-1/2 -translate-y-1 mt-2.5 group-hover/tooltip:translate-y-0`,
    left: `${tooltipBase} right-full top-1/2 -translate-y-1/2 translate-x-1 mr-2.5 group-hover/tooltip:translate-x-0`,
    right: `${tooltipBase} left-full top-1/2 -translate-y-1/2 -translate-x-1 ml-2.5 group-hover/tooltip:translate-x-0`
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group/tooltip relative flex items-center justify-center transition-all duration-200 active:scale-90 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-full h-full stroke-[2]' })}
      {!disabled && (
        <div className={posMap[tooltipPos]}>
          {label}
        </div>
      )}
    </button>
  );
};

export const Badge = ({ children, variant = 'slate' }: { children: React.ReactNode, variant?: 'blue' | 'slate' | 'red' | 'orange' | 'green' }) => {
  const variants = {
    blue: 'bg-blue-500 text-white',
    slate: 'bg-slate-50 text-slate-400',
    red: 'bg-red-50 text-red-500',
    orange: 'bg-orange-50 text-orange-500',
    green: 'bg-green-50 text-green-500'
  };
  return (
    <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] rounded ${variants[variant]}`}>
      {children}
    </div>
  );
};

export const ViewContainer = ({ children, maxWidth = '3xl', center = false, className = "" }: { children: React.ReactNode, maxWidth?: '2xl' | '3xl' | '4xl' | '5xl', center?: boolean, className?: string }) => (
  <div className={`mx-auto w-full px-4 ${center ? 'flex flex-col items-center' : ''} max-w-${maxWidth} ${className}`}>
    {children}
  </div>
);

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
                {items && items.length > 0 ? items.map((item, i) => (
                    <div key={i} className="p-3 bg-white/80 rounded-xl text-[13px] font-bold shadow-sm border border-white/50">{item}</div>
                )) : (
                  <div className="p-3 bg-white/40 rounded-xl text-[12px] font-bold opacity-30 italic">暂无内容</div>
                )}
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
