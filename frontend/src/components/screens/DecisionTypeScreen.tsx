'use client';

import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  UserGroupIcon,
  HeartIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { MobileLayout } from '../layout/MobileLayout';

interface DecisionTypeScreenProps {
  onContinue: (decisionData: any) => void;
  onBack: () => void;
}

interface DecisionDetails {
  title: string;
  description: string;
  decision_type: string;
  urgency: string;
  patient_impact: string;
  budget_range: {
    min?: number;
    max?: number;
  };
  regulatory_deadline?: string;
  estimated_duration_days?: number;
}

export function DecisionTypeScreen({ onContinue, onBack }: DecisionTypeScreenProps) {
  const [step, setStep] = useState(1);
  const [decisionDetails, setDecisionDetails] = useState<DecisionDetails>({
    title: '',
    description: '',
    decision_type: '',
    urgency: 'normal',
    patient_impact: 'none',
    budget_range: {},
  });

  const decisionTypes = [
    {
      id: 'clinical',
      name: 'Clinical Decision',
      description: 'Patient care protocols and procedures',
      icon: HeartIcon,
      color: 'bg-red-50 border-red-200 text-red-700',
      examples: ['Treatment protocols', 'Care pathways', 'Clinical guidelines']
    },
    {
      id: 'vendor_selection',
      name: 'Vendor Selection',
      description: 'Equipment, software, or service providers',
      icon: CpuChipIcon,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      examples: ['EMR systems', 'Medical equipment', 'Service contracts']
    },
    {
      id: 'hiring',
      name: 'Staffing Decision',
      description: 'Personnel and hiring decisions',
      icon: UserGroupIcon,
      color: 'bg-green-50 border-green-200 text-green-700',
      examples: ['New hires', 'Role changes', 'Department restructuring']
    },
    {
      id: 'budget',
      name: 'Budget Allocation',
      description: 'Financial planning and resource allocation',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      examples: ['Department budgets', 'Capital investments', 'Cost reduction']
    },
    {
      id: 'compliance',
      name: 'Compliance Issue',
      description: 'Regulatory and policy compliance',
      icon: ScaleIcon,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      examples: ['HIPAA compliance', 'Joint Commission', 'Quality measures']
    },
    {
      id: 'strategic',
      name: 'Strategic Planning',
      description: 'Long-term organizational decisions',
      icon: DocumentTextIcon,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      examples: ['Service expansion', 'Partnership decisions', 'Strategic initiatives']
    }
  ];

  const urgencyLevels = [
    {
      id: 'emergency',
      name: 'Emergency',
      description: 'Immediate action required',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-100 text-red-800',
      workflow: 'Emergency workflow (immediate decision + retrospective documentation)'
    },
    {
      id: 'high',
      name: 'High',
      description: 'Within 24-48 hours',
      icon: ClockIcon,
      color: 'bg-orange-100 text-orange-800',
      workflow: 'Expedited DECIDE methodology'
    },
    {
      id: 'normal',
      name: 'Normal',
      description: 'Standard timeline',
      icon: ClockIcon,
      color: 'bg-blue-100 text-blue-800',
      workflow: 'Full DECIDE methodology (6 phases)'
    },
    {
      id: 'low',
      name: 'Low',
      description: 'No immediate pressure',
      icon: ClockIcon,
      color: 'bg-green-100 text-green-800',
      workflow: 'Full DECIDE methodology with extended evaluation'
    }
  ];

  const patientImpactLevels = [
    {
      id: 'high',
      name: 'High Impact',
      description: 'Direct effect on patient safety or outcomes',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'medium',
      name: 'Medium Impact',
      description: 'Indirect effect on patient care quality',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'low',
      name: 'Low Impact',
      description: 'Minimal effect on patient care',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'none',
      name: 'No Impact',
      description: 'Administrative or operational only',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const handleContinue = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onContinue(decisionDetails);
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return decisionDetails.title.length >= 5 && decisionDetails.description.length >= 10;
      case 2:
        return decisionDetails.decision_type !== '';
      case 3:
        return decisionDetails.urgency !== '';
      case 4:
        return decisionDetails.patient_impact !== '';
      default:
        return false;
    }
  };

  return (
    <MobileLayout
      title="New Decision"
      onBack={step === 1 ? onBack : () => setStep(step - 1)}
      showProgress={true}
      currentPhase={1}
      totalPhases={6}
    >
      <div className="p-4 space-y-6">
        {/* Step 1: Title and Description */}
        {step === 1 && (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                📝 Define the Decision
              </h2>
              <p className="text-gray-600 mb-6">
                Clearly describe what decision needs to be made
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={decisionDetails.title}
                  onChange={(e) => setDecisionDetails({ ...decisionDetails, title: e.target.value })}
                  placeholder="e.g., EMR System Vendor Selection"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {decisionDetails.title.length}/200 characters
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={decisionDetails.description}
                  onChange={(e) => setDecisionDetails({ ...decisionDetails, description: e.target.value })}
                  placeholder="Describe the context, background, and what outcome you're looking for..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {decisionDetails.description.length}/2000 characters
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Decision Type */}
        {step === 2 && (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🎯 Decision Category
              </h2>
              <p className="text-gray-600 mb-6">
                Select the type that best matches your decision
              </p>
            </div>

            <div className="space-y-3">
              {decisionTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = decisionDetails.decision_type === type.id;

                return (
                  <button
                    key={type.id}
                    onClick={() => setDecisionDetails({ ...decisionDetails, decision_type: type.id })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{type.name}</h3>
                          {isSelected && <CheckIcon className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {type.examples.map((example, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Step 3: Urgency Level */}
        {step === 3 && (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ⏰ Urgency Level
              </h2>
              <p className="text-gray-600 mb-6">
                How quickly does this decision need to be made?
              </p>
            </div>

            <div className="space-y-3">
              {urgencyLevels.map((level) => {
                const Icon = level.icon;
                const isSelected = decisionDetails.urgency === level.id;

                return (
                  <button
                    key={level.id}
                    onClick={() => setDecisionDetails({ ...decisionDetails, urgency: level.id })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{level.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${level.color}`}>
                              {level.description}
                            </span>
                          </div>
                          {isSelected && <CheckIcon className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{level.workflow}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Step 4: Patient Impact */}
        {step === 4 && (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🏥 Patient Impact
              </h2>
              <p className="text-gray-600 mb-6">
                How will this decision affect patient care and safety?
              </p>
            </div>

            <div className="space-y-3">
              {patientImpactLevels.map((level) => {
                const isSelected = decisionDetails.patient_impact === level.id;

                return (
                  <button
                    key={level.id}
                    onClick={() => setDecisionDetails({ ...decisionDetails, patient_impact: level.id })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{level.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${level.color}`}>
                            {level.id.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                      </div>
                      {isSelected && <CheckIcon className="w-5 h-5 text-blue-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Additional Context for High Impact */}
            {decisionDetails.patient_impact === 'high' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">High Patient Impact Detected</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This decision will include additional patient safety considerations and may require
                      clinical review before implementation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Continue Button */}
        <div className="pt-6">
          <button
            onClick={handleContinue}
            disabled={!canContinue()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 4 ? 'Start Decision Process' : 'Continue'}
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center space-x-2 pt-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-2 h-2 rounded-full ${
                stepNumber === step
                  ? 'bg-blue-600'
                  : stepNumber < step
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}