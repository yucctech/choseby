'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api-client';
import type { CustomerDecision, DecisionCriteria, ResponseOption, TeamEvaluation } from '@/types';

export default function DecisionDetailPage() {
  return (
    <ProtectedRoute>
      <DecisionDetailContent />
    </ProtectedRoute>
  );
}

function DecisionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const decisionId = params.id as string;

  const [decision, setDecision] = useState<CustomerDecision | null>(null);
  const [criteria, setCriteria] = useState<DecisionCriteria[]>([]);
  const [options, setOptions] = useState<ResponseOption[]>([]);
  const [evaluations, setEvaluations] = useState<TeamEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDecisionData();
  }, [decisionId]);

  const loadDecisionData = async () => {
    try {
      setLoading(true);

      // Backend returns everything in a single call: {decision, criteria, options, evaluations}
      const data = await api.decisions.get(decisionId);

      setDecision(data.decision);
      setCriteria(data.criteria || []);
      setOptions(data.options || []);
      setEvaluations(data.evaluations || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load decision:', err);
      setError('Failed to load decision data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseComplete = async (phase: number) => {
    if (!decision) return;

    try {
      await api.decisions.update(decisionId, {
        current_phase: phase + 1,
        status: phase >= 6 ? 'completed' : 'in_progress',
      });
      await loadDecisionData();
    } catch (err) {
      console.error('Failed to update phase:', err);
      alert('Failed to update phase');
    }
  };

  const getPhaseStatus = (phaseNumber: number) => {
    if (!decision) return 'pending';
    if (decision.current_phase > phaseNumber) return 'completed';
    if (decision.current_phase === phaseNumber) return 'active';
    return 'pending';
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-500 text-white',
      standard: 'bg-blue-500 text-white',
      premium: 'bg-purple-500 text-white',
      enterprise: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    };
    return colors[tier] || 'bg-gray-500 text-white';
  };

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return 'bg-urgency-critical text-white';
    if (level >= 3) return 'bg-urgency-high text-white';
    if (level >= 2) return 'bg-urgency-medium text-white';
    return 'bg-urgency-low text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading decision...</p>
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Decision not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const phases = [
    { id: 1, name: 'Problem Definition', icon: '📋' },
    { id: 2, name: 'Criteria Establishment', icon: '⚖️' },
    { id: 3, name: 'Consider Options', icon: '💡' },
    { id: 4, name: 'Team Evaluation', icon: '👥' },
    { id: 5, name: 'Results Analysis', icon: '📊' },
    { id: 6, name: 'Outcome Tracking', icon: '✅' },
  ];

  const currentPhase = decision.current_phase;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{decision.title}</h1>
                <Badge className={decision.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {decision.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-gray-600">{decision.description}</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              ← Back
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Workflow Progress</h2>
          <Progress value={(currentPhase / 6) * 100} className="mb-4" />
          <div className="grid grid-cols-6 gap-4">
            {phases.map((phase) => {
              const status = getPhaseStatus(phase.id);
              return (
                <div key={phase.id} className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl ${
                      status === 'completed'
                        ? 'bg-green-500 text-white'
                        : status === 'active'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {status === 'completed' ? '✓' : phase.icon}
                  </div>
                  <p className={`text-xs font-medium ${status === 'active' ? 'text-primary-600' : 'text-gray-600'}`}>
                    {phase.name}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phase 1: Problem Definition */}
            {currentPhase === 1 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">📋 Phase 1: Problem Definition</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Decision Context</h3>
                    <p className="text-gray-600">{decision.description}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Decision Type</h3>
                    <Badge>{decision.decision_type || 'Not specified'}</Badge>
                  </div>

                  {decision.ai_classification && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">🤖 AI Analysis</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-blue-800">
                          <strong>Confidence:</strong> {(decision.ai_classification.confidence_score * 100).toFixed(0)}%
                        </p>
                        {decision.ai_classification.risk_factors && decision.ai_classification.risk_factors.length > 0 && (
                          <div>
                            <strong className="text-blue-900">Risk Factors:</strong>
                            <ul className="list-disc list-inside mt-1 text-blue-800">
                              {decision.ai_classification.risk_factors.map((risk, i) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button onClick={() => handlePhaseComplete(1)}>
                    Continue to Criteria →
                  </Button>
                </div>
              </Card>
            )}

            {/* Phase 2: Criteria Establishment */}
            {currentPhase === 2 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">⚖️ Phase 2: Criteria Establishment</h2>
                <p className="text-gray-600 mb-4">Define the criteria that will be used to evaluate response options.</p>

                {criteria.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No criteria defined yet</p>
                    <Button>+ Add Criterion</Button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{criterion.name}</h4>
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        </div>
                        <Badge>Weight: {criterion.weight}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={() => handlePhaseComplete(2)}>
                  Continue to Options →
                </Button>
              </Card>
            )}

            {/* Phase 3: Consider Options */}
            {currentPhase === 3 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">💡 Phase 3: Consider Options</h2>
                <p className="text-gray-600 mb-4">Define possible response options for this customer issue.</p>

                {options.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No options defined yet</p>
                    <Button>+ Add Option</Button>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {options.map((option) => (
                      <div key={option.id} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium mb-2">{option.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge>Cost: ${option.financial_cost}</Badge>
                          <Badge>Effort: {option.implementation_effort}</Badge>
                          <Badge>Risk: {option.risk_level}</Badge>
                          <Badge>Impact: {option.estimated_satisfaction_impact}/5</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={() => handlePhaseComplete(3)}>
                  Continue to Evaluation →
                </Button>
              </Card>
            )}

            {/* Phase 4: Team Evaluation */}
            {currentPhase === 4 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">👥 Phase 4: Team Evaluation</h2>
                <p className="text-gray-600 mb-4">Collect anonymous evaluations from team members.</p>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-blue-900 text-sm">
                    ℹ️ Evaluations are anonymous to prevent hierarchy bias and encourage honest input.
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  {evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Anonymous evaluation submitted on {new Date(evaluation.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>

                {evaluations.length === 0 && (
                  <p className="text-gray-500 text-sm mb-4">No evaluations submitted yet</p>
                )}

                <Button onClick={() => handlePhaseComplete(4)}>
                  Continue to Results →
                </Button>
              </Card>
            )}

            {/* Phase 5: Results Analysis */}
            {currentPhase === 5 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">📊 Phase 5: Results Analysis</h2>
                <p className="text-gray-600 mb-4">Review team consensus and make final decision.</p>

                <div className="text-center py-8 bg-gray-50 rounded-lg mb-4">
                  <p className="text-gray-600">Results analysis will be displayed here</p>
                </div>

                <Button onClick={() => handlePhaseComplete(5)}>
                  Complete Decision →
                </Button>
              </Card>
            )}

            {/* Phase 6: Outcome Tracking */}
            {currentPhase === 6 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">✅ Phase 6: Outcome Tracking</h2>
                <p className="text-gray-600 mb-4">Track customer satisfaction and decision outcomes.</p>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-900 font-medium">Decision Complete!</p>
                  <p className="text-green-800 text-sm mt-1">Track customer satisfaction to improve future decisions.</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Customer Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{decision.customer_name}</p>
                </div>

                {decision.customer_email && (
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{decision.customer_email}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600 mb-1">Tier</p>
                  <Badge className={getTierColor(decision.customer_tier)}>
                    {decision.customer_tier}
                  </Badge>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Urgency</p>
                  <Badge className={getUrgencyColor(decision.urgency_level)}>
                    Level {decision.urgency_level}
                  </Badge>
                </div>

                {decision.customer_value && (
                  <div>
                    <p className="text-gray-600">Lifetime Value</p>
                    <p className="font-medium">${decision.customer_value.toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600">Previous Issues</p>
                  <p className="font-medium">{decision.previous_issues_count}</p>
                </div>

                {decision.nps_score !== undefined && (
                  <div>
                    <p className="text-gray-600">NPS Score</p>
                    <p className="font-medium">{decision.nps_score}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Decision Metadata */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Decision Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Workflow Type</p>
                  <p className="font-medium">{decision.workflow_type.replace('_', ' ')}</p>
                </div>

                {decision.financial_impact !== undefined && decision.financial_impact > 0 && (
                  <div>
                    <p className="text-gray-600">Financial Impact</p>
                    <p className="font-medium">${decision.financial_impact.toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">{new Date(decision.created_at).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium">{new Date(decision.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
