import { ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { clsx } from 'clsx';

interface ResponsiveLayoutProps {
  children: ReactNode;
  variant?: 'single-column' | 'two-column' | 'three-column' | 'dashboard';
  className?: string;
}

export function ResponsiveLayout({ children, variant = 'single-column', className }: ResponsiveLayoutProps) {
  const { deviceType } = useResponsive();

  return (
    <div
      className={clsx(
        'min-h-screen bg-gray-50',
        {
          'p-4': deviceType === 'mobile',
          'p-6': deviceType === 'tablet',
          'p-8': deviceType === 'desktop',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, action, onBack }: PageHeaderProps) {
  const { isMobile } = useResponsive();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className={clsx('font-bold text-gray-900', {
              'text-xl': isMobile,
              'text-2xl md:text-3xl': !isMobile,
            })}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}

interface GridLayoutProps {
  children: ReactNode;
  cols?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: number;
  className?: string;
}

export function GridLayout({ children, cols = { mobile: 1, tablet: 2, desktop: 3 }, gap = 4, className }: GridLayoutProps) {
  return (
    <div
      className={clsx(
        'grid',
        {
          [`grid-cols-${cols.mobile || 1}`]: true,
          [`md:grid-cols-${cols.tablet || 2}`]: true,
          [`lg:grid-cols-${cols.desktop || 3}`]: true,
          [`gap-${gap}`]: true,
        },
        className
      )}
    >
      {children}
    </div>
  );
}