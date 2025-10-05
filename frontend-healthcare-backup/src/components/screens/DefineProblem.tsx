'use client';

import { useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveLayout, PageHeader } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DecisionPhaseProgress } from '@/components/ui/Progress';
import { apiClient } from '@/lib/api-client';
import type { Decision } from '@/types';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
}

interface SuccessCriteria {
  id: string;
  description: string;
  measure?: string;
}

interface DefineProblemProps {
  decision: Decision;
  onBack: () => void;
  onContinue: () => void;
}

export function DefineProblem({ decision, onBack, onContinue }: DefineProblemProps) {
  const { isMobile, isTablet } = useResponsive();
  const [problemStatement, setProblemStatement] = useState(decision.description || '');
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    { id: '1', name: 'Dr. Smith', role: 'ICU Lead' }
  ]);
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriteria[]>([
    { id: '1', description: 'Improved patient outcomes', measure: '90%+ compliance' },
    { id: '2', description: 'Staff satisfaction improvement', measure: '>85% positive feedback' },
    { id: '3', description: 'Regulatory compliance', measure: 'Zero violations' }
  ]);
  const [newStakeholder, setNewStakeholder] = useState({ name: '', role: '' });
  const [newCriteria, setNewCriteria] = useState('');
  const [frequency, setFrequency] = useState('Daily occurrences');
  const [affectedDepts, setAffectedDepts] = useState('ICU, Emergency');
  const [timeline, setTimeline] = useState('Ongoing for 6+ months');
  const [loading, setLoading] = useState(false);

  const handleAddStakeholder = () => {
    if (newStakeholder.name && newStakeholder.role) {
      setStakeholders([...stakeholders, {
        id: Date.now().toString(),
        ...newStakeholder
      }]);
      setNewStakeholder({ name: '', role: '' });
    }
  };

  const handleAddCriteria = () => {
    if (newCriteria) {
      setSuccessCriteria([...successCriteria, {
        id: Date.now().toString(),
        description: newCriteria
      }]);
      setNewCriteria('');
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      // Demo mode: Skip API call and proceed directly
      onContinue();

      // Try real API in background (won't block navigation)
      apiClient.updateDecision(decision.team_id, decision.id, {
        description: problemStatement,
        current_phase: 2
      }).catch(() => console.log('Backend unavailable - using demo mode'));
    } catch (error) {
      console.error('Failed to save problem definition:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <ResponsiveLayout>
        <PageHeader
          title="Define the Problem"
          subtitle="DECIDE Progress (1/6)"
          onBack={onBack}
        />

        <DecisionPhaseProgress currentPhase={1} variant="mobile" />

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Problem Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Current ventilator protocols are inconsistent across ICU units, leading to..."
                rows={6}
                helperText={`${problemStatement.length} / 500 characters`}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👥 Key Stakeholders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stakeholders.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-gray-600">{s.role}</p>
                  </div>
                  <button
                    onClick={() => setStakeholders(stakeholders.filter(st => st.id !== s.id))}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="space-y-2 pt-2 border-t">
                <Input
                  placeholder="Name"
                  value={newStakeholder.name}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                  size="sm"
                />
                <Input
                  placeholder="Role"
                  value={newStakeholder.role}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                  size="sm"
                />
                <Button onClick={handleAddStakeholder} size="sm" fullWidth variant="secondary">
                  + Add Stakeholder
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>✅ Success Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {successCriteria.map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <input type="checkbox" checked readOnly className="mt-1" />
                  <div className="flex-1">
                    <p className="text-sm">{c.description}</p>
                    {c.measure && <p className="text-xs text-gray-500">Measure: {c.measure}</p>}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <Input
                  placeholder="Add new success criteria"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  size="sm"
                />
                <Button onClick={handleAddCriteria} size="sm" fullWidth variant="ghost" className="mt-2">
                  + Add Criteria
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={onBack} variant="secondary" fullWidth>
              Save Draft
            </Button>
            <Button
              onClick={handleContinue}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!problemStatement.trim() || problemStatement.length < 50}
            >
              Continue →
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (isTablet) {
    return (
      <ResponsiveLayout>
        <PageHeader
          title="Phase 1: Define Problem"
          subtitle={`Progress: 1/6`}
          onBack={onBack}
          action={<DecisionPhaseProgress currentPhase={1} variant="tablet" />}
        />

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Core Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  rows={6}
                  helperText={`${problemStatement.length} / 500 characters`}
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Problem Impact Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Patient Safety Risk: <Badge variant="danger">HIGH</Badge></p>
                  <p className="text-xs text-gray-600 mt-1">Life-threatening variations</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Operational Impact: <Badge variant="warning">MEDIUM</Badge></p>
                  <p className="text-xs text-gray-600 mt-1">Training inconsistencies</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Regulatory Compliance: <Badge variant="danger">REQUIRED</Badge></p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>👥 Key Stakeholders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stakeholders.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">+ {s.name} ({s.role})</span>
                  </div>
                ))}
                <Button onClick={handleAddStakeholder} size="sm" fullWidth variant="ghost">
                  + Add Stakeholder
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>✅ Success Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {successCriteria.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <input type="checkbox" checked readOnly />
                    <span className="text-sm">{c.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="secondary">
            Save Draft
          </Button>
          <Button onClick={handleContinue} variant="primary" loading={loading}>
            Continue to Criteria →
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout className="max-w-[1600px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
              ← Dashboard
            </button>
            <h1 className="text-2xl font-bold">Phase 1: Define the Problem</h1>
          </div>
          <div className="flex items-center gap-4">
            <DecisionPhaseProgress currentPhase={1} variant="desktop" />
            <Button variant="ghost" size="sm">Help</Button>
            <Button variant="secondary" size="sm">Save Draft</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎯 CORE PROBLEM DEFINITION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Current ventilator protocols are inconsistent across ICU units, leading to patient safety risks, staff confusion during emergencies, and potential regulatory violations..."
                rows={8}
                helperText={`${problemStatement.length} / 500 characters detailed description`}
                required
              />

              <div className="space-y-3 pt-4 border-t">
                <p className="font-medium text-sm">📋 Problem Context:</p>
                <Input
                  label="Frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g., Daily occurrences"
                />
                <Input
                  label="Affected Departments"
                  value={affectedDepts}
                  onChange={(e) => setAffectedDepts(e.target.value)}
                  placeholder="e.g., ICU, Emergency"
                />
                <Input
                  label="Timeline"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g., Ongoing for 6+ months"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 BUSINESS IMPACT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Patient Safety Risk: <Badge variant="danger">HIGH</Badge></p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Life-threatening variations</li>
                  <li>• Inconsistent care standards</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Operational Impact: <Badge variant="warning">MEDIUM</Badge></p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Training inconsistencies</li>
                  <li>• Workflow disruptions</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Regulatory Risk: <Badge variant="danger">CRITICAL</Badge></p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Joint Commission standards</li>
                  <li>• CMS compliance requirements</li>
                </ul>
              </div>
              <div className="pt-3 border-t">
                <p className="font-medium">💰 Financial Impact: $50K/year</p>
                <p className="text-sm text-gray-600 mt-1">• Potential liability exposure</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>✅ SUCCESS CRITERIA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {successCriteria.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked readOnly className="mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.description}</p>
                      {c.measure && <p className="text-xs text-gray-500">Measure: {c.measure}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={handleAddCriteria} size="sm" fullWidth variant="ghost">
                + Add Success Criteria
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👥 KEY STAKEHOLDERS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stakeholders.map((s) => (
                <div key={s.id} className="text-sm">
                  + {s.name} ({s.role})
                </div>
              ))}
              <Button onClick={handleAddStakeholder} size="sm" fullWidth variant="ghost">
                + Add Stakeholder
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="secondary">
          Save Draft
        </Button>
        <Button
          onClick={handleContinue}
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!problemStatement.trim() || problemStatement.length < 50}
        >
          Continue to Phase 2: Establish Criteria →
        </Button>
      </div>
    </ResponsiveLayout>
  );
}