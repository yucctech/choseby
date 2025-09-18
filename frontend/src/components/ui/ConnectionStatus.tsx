'use client';

import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ConnectionStatusProps {
  status: 'connected' | 'reconnecting' | 'offline';
  lastSaved?: Date;
}

export function ConnectionStatus({ status, lastSaved }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: 'Connected • Real-time Active'
        };
      case 'reconnecting':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          text: 'Reconnecting... • Saved'
        };
      case 'offline':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          text: 'Offline • Working Locally'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastSaved = (date?: Date) => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <div className={`px-4 py-2 ${config.bgColor} border-b border-gray-100`}>
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        {lastSaved && (
          <span className="text-sm text-gray-500">
            • {formatLastSaved(lastSaved)}
          </span>
        )}
      </div>
    </div>
  );
}