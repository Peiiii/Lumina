
import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className = "" }) => {
  const html = useMemo(() => {
    // 使用 marked 同步解析为 HTML
    try {
      return { __html: marked.parse(content) };
    } catch (e) {
      console.error('Markdown parse error:', e);
      return { __html: content };
    }
  }, [content]);

  return (
    <div 
      className={`markdown-content text-[13px] font-bold leading-relaxed ${className}`}
      dangerouslySetInnerHTML={html}
    />
  );
};
