import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface SidebarProps {
  children: ReactNode;
  position?: 'left' | 'right';
  width?: 'narrow' | 'medium' | 'wide';
  className?: string;
}

export function Sidebar({ children, position = 'left', width = 'medium', className }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'bg-white border-gray-200 overflow-y-auto',
        {
          'border-r': position === 'left',
          'border-l': position === 'right',
          'w-64': width === 'narrow',
          'w-80': width === 'medium',
          'w-96': width === 'wide',
        },
        className
      )}
    >
      {children}
    </aside>
  );
}

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <div className={clsx('p-4', className)}>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}