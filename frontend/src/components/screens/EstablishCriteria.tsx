'use client';

import { useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveLayout, PageHeader } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DecisionPhaseProgress } from '@/components/ui/Progress';
import { apiClient } from '@/lib/api-client';
import type { Decision, DecisionCriteria } from '@/types';

interface Criterion {
  id: string;
  name: string;
  weight: number;
  category: 'clinical' | 'financial' | 'operational' | 'compliance' | 'technical';
  description?: string;
}

interface EstablishCriteriaProps {
  decision: Decision;
  onBack: () => void;
  onContinue: () => void;
}

export function EstablishCriteria({ decision, onBack, onContinue }: EstablishCriteriaProps) {
  const { isMobile, isTablet } = useResponsive();
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Patient Safety Impact', weight: 40, category: 'clinical', description: 'Life/safety impact' },
    { id: '2', name: 'Implementation Cost', weight: 25, category: 'financial', description: 'Budget and ROI impact' },
    { id: '3', name: 'Staff Training Required', weight: 20, category: 'operational', description: 'Time to competency' },
    { id: '4', name: 'Regulatory Compliance', weight: 15, category: 'compliance', description: 'CMS/Joint Commission requirements' }
  ]);
  const [newCriterion, setNewCriterion] = useState({ name: '', category: 'clinical' as const });
  const [loading, setLoading] = useState(false);

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const isWeightValid = totalWeight === 100;

  const categoryWeights = {
    clinical: criteria.filter(c => c.category === 'clinical').reduce((sum, c) => sum + c.weight, 0),
    financial: criteria.filter(c => c.category === 'financial').reduce((sum, c) => sum + c.weight, 0),
    operational: criteria.filter(c => c.category === 'operational').reduce((sum, c) => sum + c.weight, 0),
    compliance: criteria.filter(c => c.category === 'compliance').reduce((sum, c) => sum + c.weight, 0),
    technical: criteria.filter(c => c.category === 'technical').reduce((sum, c) => sum + c.weight, 0),
  };

  const handleAddCriterion = () => {
    if (newCriterion.name && criteria.length < 8) {
      setCriteria([...criteria, {
        id: Date.now().toString(),
        ...newCriterion,
        weight: Math.max(0, 100 - totalWeight)
      }]);
      setNewCriterion({ name: '', category: 'clinical' });
    }
  };

  const handleWeightChange = (id: string, newWeight: number) => {
    setCriteria(criteria.map(c =>
      c.id === id ? { ...c, weight: Math.max(0, Math.min(100, newWeight)) } : c
    ));
  };

  const handleContinue = async () => {
    if (!isWeightValid) return;

    try {
      setLoading(true);

      // Demo mode: Skip API calls and proceed directly
      onContinue();

      // Try real API in background (won't block navigation)
      for (const criterion of criteria) {
        apiClient.createCriteria(decision.id, {
          name: criterion.name,
          weight: criterion.weight,
          category: criterion.category,
          description: criterion.description,
          measurement_type: 'quantitative',
          ai_suggested: false
        }).catch(() => console.log('Demo mode'));
      }
      apiClient.updateDecision(decision.team_id, decision.id, { current_phase: 3 }).catch(() => console.log('Demo mode'));
    } catch (error) {
      console.error('Failed to save criteria:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <ResponsiveLayout>
        <PageHeader
          title="Establish Criteria"
          subtitle="DECIDE Progress (2/6)"
          onBack={onBack}
        />

        <DecisionPhaseProgress currentPhase={2} variant="mobile" />

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>⚖️ Evaluation Criteria (3-8)</CardTitle>
                <Badge variant={isWeightValid ? 'success' : 'warning'}>
                  {totalWeight}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {criteria.map((c, index) => (
                <div key={c.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{index + 1}. {c.name}</span>
                    <button
                      onClick={() => setCriteria(criteria.filter(cr => cr.id !== c.id))}
                      className="text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Weight:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={c.weight}
                      onChange={(e) => handleWeightChange(c.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{c.weight}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${c.weight}%` }}
                    />
                  </div>
                  <Badge variant="info" size="sm">{c.category}</Badge>
                </div>
              ))}

              {criteria.length < 8 && (
                <div className="pt-3 border-t space-y-2">
                  <Input
                    placeholder="Criterion name"
                    value={newCriterion.name}
                    onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
                    size="sm"
                  />
                  <select
                    value={newCriterion.category}
                    onChange={(e) => setNewCriterion({ ...newCriterion, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="clinical">Clinical/Safety</option>
                    <option value="financial">Financial</option>
                    <option value="operational">Operational</option>
                    <option value="compliance">Compliance</option>
                    <option value="technical">Technical</option>
                  </select>
                  <Button onClick={handleAddCriterion} size="sm" fullWidth variant="secondary">
                    + Add Criteria
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={onBack} variant="secondary" fullWidth>
              Back
            </Button>
            <Button
              onClick={handleContinue}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!isWeightValid || criteria.length < 3}
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
          title="Phase 2: Establish Criteria"
          subtitle="Progress: 2/6"
          onBack={onBack}
          action={<DecisionPhaseProgress currentPhase={2} variant="tablet" />}
        />

        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>⚖️ Decision Criteria (3-8 required)</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Total Weight: <Badge variant={isWeightValid ? 'success' : 'warning'}>{totalWeight}%</Badge>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {criteria.map((c, index) => (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{index + 1}. {c.name}</span>
                    <Badge variant="info" size="sm">{c.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={c.weight}
                      onChange={(e) => handleWeightChange(c.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-medium w-16">{c.weight}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.weight}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Weight Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Clinical: {categoryWeights.clinical}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${categoryWeights.clinical}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Financial: {categoryWeights.financial}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${categoryWeights.financial}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Operational: {categoryWeights.operational}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${categoryWeights.operational}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t">
                {isWeightValid ? (
                  <Badge variant="success">✅ Balanced portfolio</Badge>
                ) : (
                  <Badge variant="warning">⚠️ Adjust weights to 100%</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="secondary">Back</Button>
          <Button onClick={handleContinue} variant="primary" loading={loading} disabled={!isWeightValid}>
            Continue to Options →
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
            <h1 className="text-2xl font-bold">Phase 2: Establish Evaluation Criteria</h1>
          </div>
          <div className="flex items-center gap-4">
            <DecisionPhaseProgress currentPhase={2} variant="desktop" />
            <Button variant="ghost" size="sm">AI Assist</Button>
            <Button variant="ghost" size="sm">Templates</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>⚖️ EVALUATION CRITERIA FRAMEWORK</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Total Weight: <Badge variant={isWeightValid ? 'success' : 'warning'}>{totalWeight}%</Badge>
                {!isWeightValid && <span className="text-red-600 ml-2">Must equal 100%</span>}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((c, index) => (
                <div key={c.id} className="space-y-2 pb-3 border-b last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{index + 1}. {c.name}</p>
                      <p className="text-sm text-gray-600">Category: {c.category} | {c.description}</p>
                    </div>
                    <button onClick={() => setCriteria(criteria.filter(cr => cr.id !== c.id))} className="text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-16">Weight:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={c.weight}
                      onChange={(e) => handleWeightChange(c.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={c.weight}
                      onChange={(e) => handleWeightChange(c.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${c.weight}%` }} />
                  </div>
                </div>
              ))}
              {criteria.length < 8 && (
                <Button onClick={handleAddCriterion} fullWidth variant="secondary">
                  + Add Criterion (Max 8)
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 WEIGHT OPTIMIZATION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">Current Distribution:</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clinical</span>
                    <span>{categoryWeights.clinical}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${categoryWeights.clinical}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Financial</span>
                    <span>{categoryWeights.financial}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${categoryWeights.financial}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Operational</span>
                    <span>{categoryWeights.operational}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${categoryWeights.operational}%` }} />
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t">
                {isWeightValid && <Badge variant="success">✅ Balanced Portfolio</Badge>}
                {categoryWeights.clinical > 60 && <p className="text-xs text-yellow-600 mt-2">⚠️ High clinical focus</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📈 HISTORICAL ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Medication Guidelines (Mar 2025):</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• Patient Safety: 45%</li>
                  <li>• Cost Impact: 25%</li>
                  <li>• Training: 20%</li>
                </ul>
                <p className="text-xs text-green-600 mt-1">Result: 94% team satisfaction</p>
              </div>
              <div className="pt-2 border-t">
                <Button size="sm" variant="ghost" fullWidth>Apply Template</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="secondary">Back</Button>
        <Button onClick={handleContinue} variant="primary" size="lg" loading={loading} disabled={!isWeightValid || criteria.length < 3}>
          Continue to Phase 3: Consider Options →
        </Button>
      </div>
    </ResponsiveLayout>
  );
}