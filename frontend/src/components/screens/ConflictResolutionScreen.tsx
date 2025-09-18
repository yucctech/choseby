'use client';

import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { MobileLayout } from '../layout/MobileLayout';

interface Conflict {
  id: string;
  option_name: string;
  criterion_name: string;
  variance_score: number;
  conflict_level: 'low' | 'medium' | 'high' | 'critical';
  evaluation_count: number;
  score_range: {
    mean: number;
    min: number;
    max: number;
  };
}

interface ConflictResolutionScreenProps {
  conflicts: Conflict[];
  consensusLevel: number;
  anonymousConcerns: string[];
  onStartResolution: (resolutionType: string, facilitatorId?: string) => void;
  onContinueWithConflicts: () => void;
  onBack: () => void;
}

export function ConflictResolutionScreen({
  conflicts,
  consensusLevel,
  anonymousConcerns,
  onStartResolution,
  onContinueWithConflicts,
  onBack
}: ConflictResolutionScreenProps) {
  const [selectedResolution, setSelectedResolution] = useState<string>('');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [discussionMessages, setDiscussionMessages] = useState<Array<{ text: string; timestamp: Date }>>([]);
  const [newMessage, setNewMessage] = useState('');

  const getConflictColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConflictIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const resolutionMethods = [
    {
      id: 'discussion_forum',
      name: 'Structured Discussion',
      description: 'Anonymous team discussion to address concerns',
      icon: ChatBubbleLeftRightIcon,
      time: '30-60 minutes',
      recommended: true
    },
    {
      id: 'facilitated_meeting',
      name: 'Facilitated Meeting',
      description: 'Video call with team facilitator to resolve issues',
      icon: UserGroupIcon,
      time: '1-2 hours',
      recommended: false
    },
    {
      id: 're_evaluation',
      name: 'Additional Information',
      description: 'Gather more data before re-evaluation',
      icon: DocumentTextIcon,
      time: '2-4 hours',
      recommended: false
    }
  ];

  const handleStartDiscussion = () => {
    setSelectedResolution('discussion_forum');
    setShowDiscussion(true);
    onStartResolution('discussion_forum');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setDiscussionMessages([
        ...discussionMessages,
        { text: newMessage, timestamp: new Date() }
      ]);
      setNewMessage('');
    }
  };

  if (showDiscussion) {
    return (
      <MobileLayout
        title="Team Discussion"
        onBack={() => setShowDiscussion(false)}
        showProgress={true}
        currentPhase={3}
        totalPhases={6}
        showAnonymous={true}
        connectionStatus="connected"
      >
        <div className="flex flex-col h-full">
          {/* Discussion Header */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">Live Discussion</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Quality Control Concerns</h2>
            <p className="text-sm text-gray-600">Focus: Alternative 3 - Outsource Function</p>
          </div>

          {/* Participants */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <UserGroupIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Live Participants: 4/5</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Dr. Smith (Facilitator)
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Nurse Johnson
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Dr. Williams
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Admin Brown
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                Pharmacist Davis (away)
              </span>
            </div>
          </div>

          {/* Discussion Guidelines */}
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Discussion Guidelines:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Focus on patient outcomes</li>
              <li>2. Share specific concerns</li>
              <li>3. Suggest improvements</li>
              <li>4. Remain professional</li>
            </ol>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* System Messages */}
            <div className="text-center">
              <div className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                Discussion started • Focus on quality control concerns
              </div>
            </div>

            {/* Sample Discussion Points */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Anonymous input:</div>
              <div className="text-sm text-gray-900">"Need quality metrics defined before outsourcing"</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Anonymous input:</div>
              <div className="text-sm text-gray-900">"Pilot program could reduce risk significantly"</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Anonymous input:</div>
              <div className="text-sm text-gray-900">"Cost savings may offset quality concerns if managed properly"</div>
            </div>

            {/* Dynamic Messages */}
            {discussionMessages.map((message, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-600 mb-1">
                  Your anonymous input • {message.timestamp.toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-900">{message.text}</div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <h4 className="text-sm font-medium text-blue-900">Anonymous Input</h4>
              <p className="text-xs text-blue-700">Your contributions remain private and anonymous</p>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your specific concerns or suggestions..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>

            <div className="flex space-x-2 mt-3">
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium">
                Extend Discussion (5 min)
              </button>
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                Move to Resolution →
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Resolve Conflicts"
      onBack={onBack}
      showProgress={true}
      currentPhase={3}
      totalPhases={6}
    >
      <div className="p-4 space-y-6">
        {/* Conflict Status Header */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-orange-900">Team Conflicts Detected</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-orange-700">Consensus Level:</span>
              <div className="text-xl font-bold text-orange-900">{consensusLevel}%</div>
            </div>
            <div>
              <span className="text-orange-700">Conflicts Found:</span>
              <div className="text-xl font-bold text-orange-900">{conflicts.length}</div>
            </div>
          </div>
        </div>

        {/* Conflict Breakdown */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Conflict Breakdown:</h3>
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`border-2 rounded-lg p-4 ${getConflictColor(conflict.conflict_level)}`}
              >
                <div className="flex items-start space-x-3">
                  {getConflictIcon(conflict.conflict_level)}
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {conflict.option_name}
                    </h4>
                    <p className="text-sm opacity-90 mt-1">
                      Disagreement on: {conflict.criterion_name}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span>Variance: {conflict.variance_score.toFixed(1)}</span>
                      <span>Range: {conflict.score_range.min}-{conflict.score_range.max}</span>
                      <span>{conflict.evaluation_count} evaluations</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full`}>
                    {conflict.conflict_level.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anonymous Concerns */}
        {anonymousConcerns.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Anonymous Team Concerns:</h3>
            <div className="space-y-2">
              {anonymousConcerns.slice(0, 3).map((concern, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">"{concern}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Options */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Facilitation Options:</h3>
          <div className="space-y-3">
            {resolutionMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedResolution === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedResolution(method.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        {method.recommended && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                      <span className="text-xs text-gray-500">Estimated time: {method.time}</span>
                    </div>
                    {isSelected && <CheckCircleIcon className="w-5 h-5 text-blue-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedResolution === 'discussion_forum' && (
            <button
              onClick={handleStartDiscussion}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
            >
              Start Structured Discussion
            </button>
          )}

          {selectedResolution === 'facilitated_meeting' && (
            <button
              onClick={() => onStartResolution('facilitated_meeting')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
            >
              Schedule Facilitated Meeting
            </button>
          )}

          {selectedResolution === 're_evaluation' && (
            <button
              onClick={() => onStartResolution('re_evaluation')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
            >
              Request Additional Information
            </button>
          )}

          <button
            onClick={onContinueWithConflicts}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50"
          >
            Continue with Conflicts
          </button>
        </div>

        {/* Resolution Impact Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <ArrowPathIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Why Resolve Conflicts?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Addressing team disagreements improves decision quality and team buy-in.
                Healthcare decisions benefit from diverse perspectives and thorough evaluation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}