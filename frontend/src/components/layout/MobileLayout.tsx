'use client';

import React from 'react';
import { ChevronLeftIcon, WifiIcon, SignalIcon, BellIcon } from '@heroicons/react/24/outline';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { AnonymousIndicator } from '../ui/AnonymousIndicator';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  showProgress?: boolean;
  currentPhase?: number;
  totalPhases?: number;
  showAnonymous?: boolean;
  connectionStatus?: 'connected' | 'reconnecting' | 'offline';
}

export function MobileLayout({
  children,
  title,
  onBack,
  showProgress = false,
  currentPhase = 1,
  totalPhases = 6,
  showAnonymous = false,
  connectionStatus = 'connected'
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto border-x border-gray-200">
      {/* Mobile Status Bar */}
      <div className="bg-gray-900 text-white text-xs px-4 py-1 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span>9:41</span>
        </div>
        <div className="flex items-center space-x-1">
          <SignalIcon className="w-3 h-3" />
          <WifiIcon className="w-3 h-3" />
          <div className="text-xs">100%</div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 -m-1 text-gray-600 hover:text-gray-900"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-48">
              {title}
            </h1>
            {showProgress && (
              <div className="text-sm text-gray-500">
                DECIDE Progress ({currentPhase}/{totalPhases})
              </div>
            )}
          </div>
        </div>
        <BellIcon className="w-5 h-5 text-gray-600" />
      </header>

      {/* System Trust Indicators */}
      <div className="bg-white border-b border-gray-100">
        <ConnectionStatus status={connectionStatus} />
        {showAnonymous && <AnonymousIndicator />}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Safe Area for Mobile */}
      <div className="h-safe-bottom bg-gray-50"></div>
    </div>
  );
}