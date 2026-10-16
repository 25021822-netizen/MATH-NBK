import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  latex?: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, latex, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      // Làm sạch công thức nếu có dấu $ bọc ngoài
      let cleanMath = (math || latex || '').trim();
      if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
        cleanMath = cleanMath.slice(1, -1).trim();
      }

      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.warn('Lỗi hiển thị KaTeX:', err);
      return `<code>${math}</code>`;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block font-sans ${block ? 'my-2 overflow-x-auto max-w-full text-center' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
