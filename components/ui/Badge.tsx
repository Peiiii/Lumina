
import React from 'react';

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
