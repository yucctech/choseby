'use client';

import { useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveLayout, PageHeader } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import type { Team } from '@/types';
import { clsx } from 'clsx';

interface DecisionCreationProps {
  team: Team;
  onBack: () => void;
  onContinue: (decisionId: string) => void;
}

type WorkflowType = 'emergency' | 'express' | 'full_decide';
type PatientImpact = 'none' | 'low' | 'medium' | 'high';

export function DecisionCreation({ team, onBack, onContinue }: DecisionCreationProps) {
  const { isMobile } = useResponsive();
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('full_decide');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [patientImpact, setPatientImpact] = useState<PatientImpact>('medium');
  const [compliance, setCompliance] = useState({
    jointCommission: false,
    cms: false,
    hipaa: false,
  });
  const [loading, setLoading] = useState(false);

  const handleCreateDecision = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      const decision = await apiClient.createDecision(team.id, {
        title,
        description,
        workflow_type: workflowType,
        patient_impact: patientImpact,
        status: workflowType === 'emergency' ? 'emergency' : 'in_progress',
        current_phase: 1,
        urgency: workflowType === 'emergency' ? 'emergency' : 'normal',
        decision_type: 'clinical',
      });
      onContinue(decision.id);
    } catch (error) {
      console.error('Failed to create decision:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'type') {
    return (
      <ResponsiveLayout>
        <PageHeader
          title="Create New Decision"
          subtitle="Select decision workflow type"
          onBack={onBack}
        />

        <div className={clsx('space-y-4', { 'max-w-2xl mx-auto': !isMobile })}>
          <Card
            variant={workflowType === 'emergency' ? 'emergency' : 'outlined'}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setWorkflowType('emergency')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  🚨
                </div>
                <div className="flex-1">
                  <CardTitle>Emergency Decision</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">For urgent patient safety situations requiring immediate action (&lt;2 hours)</p>
                </div>
                {workflowType === 'emergency' && (
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card
            variant={workflowType === 'express' ? 'elevated' : 'outlined'}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setWorkflowType('express')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  ⚡
                </div>
                <div className="flex-1">
                  <CardTitle>Express Decision</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Streamlined 3-phase process for time-sensitive decisions (&lt;2 days)</p>
                </div>
                {workflowType === 'express' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card
            variant={workflowType === 'full_decide' ? 'elevated' : 'outlined'}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setWorkflowType('full_decide')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  📋
                </div>
                <div className="flex-1">
                  <CardTitle>Full DECIDE Methodology</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Complete 6-phase structured decision process with anonymous evaluation</p>
                </div>
                {workflowType === 'full_decide' && (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button onClick={onBack} variant="secondary" fullWidth={isMobile}>
              Cancel
            </Button>
            <Button onClick={() => setStep('details')} variant="primary" fullWidth={isMobile}>
              Continue →
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <PageHeader
        title={workflowType === 'emergency' ? '🚨 Emergency Decision Setup' : 'Decision Setup'}
        subtitle={`${workflowType === 'express' ? 'Express' : workflowType === 'full_decide' ? 'Full DECIDE' : 'Emergency'} Workflow`}
        onBack={() => setStep('type')}
      />

      <div className={clsx('space-y-6', { 'max-w-4xl mx-auto': !isMobile })}>
        <Card>
          <CardHeader>
            <CardTitle>Decision Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Decision Title"
              placeholder="e.g., Ventilator Protocol Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe the decision context and current situation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              helperText={`${description.length} / 500 characters`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Healthcare Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Impact Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['none', 'low', 'medium', 'high'] as PatientImpact[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setPatientImpact(level)}
                    className={clsx(
                      'px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                      {
                        'border-gray-300 text-gray-700 hover:border-gray-400': patientImpact !== level,
                        'border-blue-600 bg-blue-50 text-blue-700': patientImpact === level,
                        'border-red-600 bg-red-50 text-red-700': patientImpact === level && level === 'high',
                      }
                    )}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regulatory Compliance
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compliance.jointCommission}
                    onChange={(e) => setCompliance({ ...compliance, jointCommission: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Joint Commission Standards</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compliance.cms}
                    onChange={(e) => setCompliance({ ...compliance, cms: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">CMS Requirements</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compliance.hipaa}
                    onChange={(e) => setCompliance({ ...compliance, hipaa: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">HIPAA Privacy Protection</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{team.name}</p>
                <p className="text-sm text-gray-600">{team.member_count || 8} team members</p>
              </div>
              <Badge variant="info">Selected</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-4">
          <Button onClick={() => setStep('type')} variant="secondary" fullWidth={isMobile}>
            Back
          </Button>
          <Button
            onClick={handleCreateDecision}
            variant={workflowType === 'emergency' ? 'emergency' : 'primary'}
            fullWidth={isMobile}
            loading={loading}
            disabled={!title.trim()}
          >
            Create Decision & Continue →
          </Button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}