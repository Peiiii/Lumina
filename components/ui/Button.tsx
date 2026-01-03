
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tint' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

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
  isRound = false,
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
  isRound?: boolean,
  className?: string
}) => {
  const sizeClasses = {
    sm: `w-7 h-7 ${isRound ? 'rounded-full' : 'rounded-lg'} p-1.5`,
    md: `w-9 h-9 ${isRound ? 'rounded-full' : 'rounded-xl'} p-2`,
    lg: `w-11 h-11 ${isRound ? 'rounded-full' : 'rounded-2xl'} p-2.5`
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
