import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, size = 'md', variant = 'default', showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg',
          })}
        >
          <div
            className={clsx('h-full transition-all duration-300 ease-in-out', {
              'bg-blue-600': variant === 'default',
              'bg-green-600': variant === 'success',
              'bg-yellow-600': variant === 'warning',
              'bg-red-600': variant === 'danger',
            })}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

interface DecisionPhaseProgressProps {
  currentPhase: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'mobile' | 'tablet' | 'desktop';
}

export function DecisionPhaseProgress({ currentPhase, variant = 'desktop' }: DecisionPhaseProgressProps) {
  const phases = [
    { id: 1, name: 'Define', shortName: 'D' },
    { id: 2, name: 'Establish', shortName: 'E' },
    { id: 3, name: 'Consider', shortName: 'C' },
    { id: 4, name: 'Evaluate', shortName: 'I' },
    { id: 5, name: 'Develop', shortName: 'D' },
    { id: 6, name: 'Monitor', shortName: 'E' },
  ];

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-1">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors',
              {
                'bg-blue-600 text-white': phase.id === currentPhase,
                'bg-green-500 text-white': phase.id < currentPhase,
                'bg-gray-200 text-gray-500': phase.id > currentPhase,
              }
            )}
          >
            {phase.shortName}
          </div>
        ))}
        <span className="ml-2 text-sm text-gray-600">{currentPhase}/6</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {phases.map((phase, index) => (
          <div key={phase.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors',
                  {
                    'bg-blue-600 text-white ring-4 ring-blue-100': phase.id === currentPhase,
                    'bg-green-500 text-white': phase.id < currentPhase,
                    'bg-gray-200 text-gray-500': phase.id > currentPhase,
                  }
                )}
              >
                {phase.id}
              </div>
              <span className={clsx('mt-1 text-xs md:text-sm font-medium', {
                'text-blue-600': phase.id === currentPhase,
                'text-green-600': phase.id < currentPhase,
                'text-gray-500': phase.id > currentPhase,
              })}>
                {phase.name}
              </span>
            </div>
            {index < phases.length - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div className={clsx('h-full rounded-full', {
                  'bg-green-500': phase.id < currentPhase,
                  'bg-gray-200': phase.id >= currentPhase,
                })} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}