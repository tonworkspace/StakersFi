import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {content}
      </div>
    </div>
  );
}; 