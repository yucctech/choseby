'use client';

import React, { useState } from 'react';
import { LockClosedIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function AnonymousIndicator() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <LockClosedIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Anonymous Mode Active
          </span>
          <button
            onClick={() => setShowDetails(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline ml-auto"
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Privacy Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Anonymous Input Protection
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                </div>
                <div className="text-sm text-gray-700">
                  Input not linked to your ID
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                </div>
                <div className="text-sm text-gray-700">
                  Responses aggregated only
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                </div>
                <div className="text-sm text-gray-700">
                  No individual tracking
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                </div>
                <div className="text-sm text-gray-700">
                  HIPAA compliant encryption
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Technical:</span> Session-based tokens
                ensure your privacy throughout the decision process.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Got it
              </button>
              <button
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}