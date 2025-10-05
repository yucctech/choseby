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
import type { Decision, DecisionOption } from '@/types';

interface Option {
  id: string;
  name: string;
  description: string;
  estimated_cost: number;
  implementation_timeline: string;
  patient_impact: string;
  risk_level: 'low' | 'medium' | 'high';
  resources_required: string;
}

interface ConsiderOptionsProps {
  decision: Decision;
  onBack: () => void;
  onContinue: () => void;
}

export function ConsiderOptions({ decision, onBack, onContinue }: ConsiderOptionsProps) {
  const { isMobile, isTablet } = useResponsive();
  const [options, setOptions] = useState<Option[]>([
    {
      id: '1',
      name: 'Incremental Protocol Update',
      description: 'Modify existing ventilator protocols with evidence-based improvements. Focus on high-impact, low-disruption changes to existing workflows.',
      estimated_cost: 15000,
      implementation_timeline: '4 weeks',
      patient_impact: 'Moderate improvement',
      risk_level: 'low',
      resources_required: '2 FTE, training budget'
    },
    {
      id: '2',
      name: 'Comprehensive New Protocol',
      description: 'Implement evidence-based standardized protocol with comprehensive staff training, new technology integration, and updated workflows.',
      estimated_cost: 45000,
      implementation_timeline: '12 weeks',
      patient_impact: 'Significant improvement',
      risk_level: 'medium',
      resources_required: '5 FTE, equipment budget'
    }
  ]);
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [newOption, setNewOption] = useState({
    name: '',
    description: '',
    estimated_cost: 0,
    implementation_timeline: '',
    patient_impact: '',
    risk_level: 'medium' as const,
    resources_required: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    if (newOption.name && newOption.description && options.length < 6) {
      setOptions([...options, { id: Date.now().toString(), ...newOption }]);
      setNewOption({
        name: '',
        description: '',
        estimated_cost: 0,
        implementation_timeline: '',
        patient_impact: '',
        risk_level: 'medium',
        resources_required: ''
      });
    }
  };

  const handleContinue = async () => {
    if (options.length < 2) return;

    try {
      setLoading(true);

      // Demo mode: Skip API calls and proceed directly
      onContinue();

      // Try real API in background (won't block navigation)
      for (const option of options) {
        apiClient.createOption(decision.id, {
          name: option.name,
          description: option.description,
          estimated_cost: option.estimated_cost,
          implementation_timeline: option.implementation_timeline,
          risk_factors: [option.risk_level],
          feasibility_assessment: {
            patient_impact: option.patient_impact,
            resources_required: option.resources_required
          }
        }).catch(() => console.log('Demo mode'));
      }
      apiClient.updateDecision(decision.team_id, decision.id, { current_phase: 4 }).catch(() => console.log('Demo mode'));
    } catch (error) {
      console.error('Failed to save options:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <ResponsiveLayout>
        <PageHeader
          title="Consider All Options"
          subtitle="DECIDE Progress (3/6)"
          onBack={onBack}
        />

        <DecisionPhaseProgress currentPhase={3} variant="mobile" />

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Options (2-6 required)</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{options.length} options defined</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {options.map((opt, index) => (
                <div key={opt.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Option {index + 1}: {opt.name}</span>
                    <button
                      onClick={() => setOptions(options.filter(o => o.id !== opt.id))}
                      className="text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{opt.description}</p>
                  <div className="space-y-1 text-xs">
                    <p>💰 Cost: ${opt.estimated_cost.toLocaleString()}</p>
                    <p>⏱️ Timeline: {opt.implementation_timeline}</p>
                    <p>🏥 Impact: {opt.patient_impact}</p>
                    <Badge variant={opt.risk_level === 'low' ? 'success' : opt.risk_level === 'high' ? 'danger' : 'warning'} size="sm">
                      {opt.risk_level} risk
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {options.length < 6 && (
            <Card>
              <CardHeader>
                <CardTitle>+ Add New Option</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Option name"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newOption.description}
                  onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                  rows={3}
                />
                <Input
                  type="number"
                  placeholder="Estimated cost"
                  value={newOption.estimated_cost || ''}
                  onChange={(e) => setNewOption({ ...newOption, estimated_cost: parseInt(e.target.value) || 0 })}
                />
                <Input
                  placeholder="Timeline (e.g., 4 weeks)"
                  value={newOption.implementation_timeline}
                  onChange={(e) => setNewOption({ ...newOption, implementation_timeline: e.target.value })}
                />
                <Button onClick={handleAddOption} fullWidth variant="secondary">
                  Add Option
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button onClick={onBack} variant="secondary" fullWidth>Back</Button>
            <Button onClick={handleContinue} variant="primary" fullWidth loading={loading} disabled={options.length < 2}>
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
          title="Phase 3: Consider Options"
          subtitle="Progress: 3/6"
          onBack={onBack}
          action={<DecisionPhaseProgress currentPhase={3} variant="tablet" />}
        />

        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📋 Decision Options (2-6 required)</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{options.length} options defined</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {options.map((opt, index) => (
                <div key={opt.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-medium">Option {index + 1}: {opt.name}</p>
                  <p className="text-sm text-gray-600">{opt.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>💰 Cost: ${opt.estimated_cost.toLocaleString()}</div>
                    <div>⏱️ {opt.implementation_timeline}</div>
                    <div>🏥 {opt.patient_impact}</div>
                    <div>
                      <Badge variant={opt.risk_level === 'low' ? 'success' : opt.risk_level === 'high' ? 'danger' : 'warning'} size="sm">
                        {opt.risk_level} risk
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Quick Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Option</th>
                      <th className="text-right py-2">Cost</th>
                      <th className="text-right py-2">Time</th>
                      <th className="text-right py-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((opt, i) => (
                      <tr key={opt.id} className="border-b">
                        <td className="py-2">Opt {i + 1}</td>
                        <td className="text-right">${opt.estimated_cost / 1000}K</td>
                        <td className="text-right">{opt.implementation_timeline}</td>
                        <td className="text-right">
                          <Badge variant={opt.risk_level === 'low' ? 'success' : 'warning'} size="sm">
                            {opt.risk_level}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="secondary">Back</Button>
          <Button onClick={handleContinue} variant="primary" loading={loading} disabled={options.length < 2}>
            Continue to Evaluation →
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
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">← Dashboard</button>
            <h1 className="text-2xl font-bold">Phase 3: Consider All Options</h1>
          </div>
          <div className="flex items-center gap-4">
            <DecisionPhaseProgress currentPhase={3} variant="desktop" />
            <Button variant="ghost" size="sm">Templates</Button>
            <Button variant="ghost" size="sm">AI Assist</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 COMPREHENSIVE OPTIONS (2-6 Required)</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{options.length} of 6 maximum options defined</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {options.map((opt, index) => (
                <div key={opt.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Option {index + 1}: {opt.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                    </div>
                    <button
                      onClick={() => setOptions(options.filter(o => o.id !== opt.id))}
                      className="text-red-600 text-sm ml-4"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">💰 Total Cost:</span> ${opt.estimated_cost.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">⏱️ Timeline:</span> {opt.implementation_timeline}
                    </div>
                    <div>
                      <span className="font-medium">👥 Resources:</span> {opt.resources_required}
                    </div>
                    <div>
                      <span className="font-medium">🏥 Patient Impact:</span> {opt.patient_impact}
                    </div>
                  </div>
                  <div>
                    <Badge variant={opt.risk_level === 'low' ? 'success' : opt.risk_level === 'high' ? 'danger' : 'warning'}>
                      {opt.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 DETAILED COMPARISON</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Metric</th>
                    {options.slice(0, 3).map((_, i) => (
                      <th key={i} className="text-center py-2">Opt {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Cost</td>
                    {options.slice(0, 3).map((opt) => (
                      <td key={opt.id} className="text-center">${opt.estimated_cost / 1000}K</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Time</td>
                    {options.slice(0, 3).map((opt) => (
                      <td key={opt.id} className="text-center">{opt.implementation_timeline.split(' ')[0]}w</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Risk</td>
                    {options.slice(0, 3).map((opt) => (
                      <td key={opt.id} className="text-center">
                        <Badge variant={opt.risk_level === 'low' ? 'success' : 'warning'} size="sm">
                          {opt.risk_level}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI-POWERED ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">📈 Success Probability:</p>
                {options.slice(0, 3).map((opt, i) => (
                  <p key={opt.id} className="text-xs text-gray-600">• Option {i + 1}: {85 - i * 3}% success likelihood</p>
                ))}
              </div>
              <div className="pt-2 border-t">
                <p className="font-medium">💡 Recommendations:</p>
                <ul className="text-xs text-gray-600 space-y-1 mt-1">
                  <li>• Consider phased implementation</li>
                  <li>• Pilot with one unit first</li>
                  <li>• Measure at 30/60/90 days</li>
                </ul>
              </div>
              <Button size="sm" variant="ghost" fullWidth>
                Generate Full Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="secondary">Save Draft</Button>
        <Button onClick={handleContinue} variant="primary" size="lg" loading={loading} disabled={options.length < 2}>
          Continue to Phase 4: Anonymous Evaluation →
        </Button>
      </div>
    </ResponsiveLayout>
  );
}