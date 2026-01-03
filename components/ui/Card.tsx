
import React from 'react';

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
