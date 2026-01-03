
import React from 'react';

export const ViewContainer = ({ children, maxWidth = '3xl', center = false, className = "" }: { children: React.ReactNode, maxWidth?: '2xl' | '3xl' | '4xl' | '5xl', center?: boolean, className?: string }) => (
  <div className={`mx-auto w-full px-4 ${center ? 'flex flex-col items-center' : ''} max-w-${maxWidth} ${className}`}>
    {children}
  </div>
);
