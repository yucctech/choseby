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

  // Criteria management state
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [criteriaFormData, setCriteriaFormData] = useState<Array<{name: string; description: string; weight: number}>>([
    { name: '', description: '', weight: 1.0 }
  ]);

  // Options management state
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [optionsFormData, setOptionsFormData] = useState<Array<{
    title: string;
    description: string;
    financial_cost: number;
    implementation_effort: string;
    risk_level: string;
    estimated_satisfaction_impact: number;
  }>>([
    { title: '', description: '', financial_cost: 0, implementation_effort: 'medium', risk_level: 'medium', estimated_satisfaction_impact: 3 }
  ]);

  // Evaluation submission state
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [selectedOptionForEval, setSelectedOptionForEval] = useState<string>('');
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
  const [evaluationComments, setEvaluationComments] = useState('');

  // Results analysis state
  const [results, setResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);

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

  const handleSaveCriteria = async () => {
    try {
      // Filter out empty criteria
      const validCriteria = criteriaFormData.filter(c => c.name.trim() !== '');

      if (validCriteria.length === 0) {
        alert('Please add at least one criterion');
        return;
      }

      await api.decisions.updateCriteria(decisionId, { criteria: validCriteria });
      await loadDecisionData();
      setShowCriteriaForm(false);
      setCriteriaFormData([{ name: '', description: '', weight: 1.0 }]);
    } catch (err) {
      console.error('Failed to save criteria:', err);
      alert('Failed to save criteria');
    }
  };

  const handleAddCriterion = () => {
    setCriteriaFormData([...criteriaFormData, { name: '', description: '', weight: 1.0 }]);
  };

  const handleRemoveCriterion = (index: number) => {
    const newData = criteriaFormData.filter((_, i) => i !== index);
    setCriteriaFormData(newData.length > 0 ? newData : [{ name: '', description: '', weight: 1.0 }]);
  };

  const handleCriterionChange = (index: number, field: 'name' | 'description' | 'weight', value: string | number) => {
    const newData = [...criteriaFormData];
    newData[index] = { ...newData[index], [field]: value };
    setCriteriaFormData(newData);
  };

  // Options management handlers
  const handleSaveOptions = async () => {
    try {
      const validOptions = optionsFormData.filter(o => o.title.trim() !== '' && o.description.trim() !== '');
      if (validOptions.length === 0) {
        alert('Please add at least one option with title and description');
        return;
      }

      await api.decisions.updateOptions(decisionId, { options: validOptions });
      await loadDecisionData();
      setShowOptionsForm(false);
      setOptionsFormData([{ title: '', description: '', financial_cost: 0, implementation_effort: 'medium', risk_level: 'medium', estimated_satisfaction_impact: 3 }]);
    } catch (err) {
      console.error('Failed to save options:', err);
      alert('Failed to save options');
    }
  };

  const handleAddOption = () => {
    setOptionsFormData([...optionsFormData, { title: '', description: '', financial_cost: 0, implementation_effort: 'medium', risk_level: 'medium', estimated_satisfaction_impact: 3 }]);
  };

  const handleRemoveOption = (index: number) => {
    const newData = optionsFormData.filter((_, i) => i !== index);
    setOptionsFormData(newData.length > 0 ? newData : [{ title: '', description: '', financial_cost: 0, implementation_effort: 'medium', risk_level: 'medium', estimated_satisfaction_impact: 3 }]);
  };

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newData = [...optionsFormData];
    newData[index] = { ...newData[index], [field]: value };
    setOptionsFormData(newData);
  };

  // Evaluation submission handlers
  const handleSubmitEvaluation = async () => {
    try {
      if (!selectedOptionForEval) {
        alert('Please select an option to evaluate');
        return;
      }

      // Check if all criteria have scores
      const missingScores = criteria.filter(c => !criteriaScores[c.id]);
      if (missingScores.length > 0) {
        alert('Please provide scores for all criteria');
        return;
      }

      // Transform scores from {criteria_id: score} to array of evaluation objects
      const evaluations = Object.entries(criteriaScores).map(([criteriaId, score]) => ({
        option_id: selectedOptionForEval,
        criteria_id: criteriaId,
        score: score,
        confidence: 3, // Default confidence level
        comment: evaluationComments || undefined,
      }));

      await api.evaluations.submit(decisionId, { evaluations });

      await loadDecisionData();
      setShowEvaluationForm(false);
      setSelectedOptionForEval('');
      setCriteriaScores({});
      setEvaluationComments('');
      alert('Evaluation submitted successfully! ✅');
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      alert('Failed to submit evaluation');
    }
  };

  const handleCriteriaScoreChange = (criterionId: string, score: number) => {
    setCriteriaScores(prev => ({
      ...prev,
      [criterionId]: score,
    }));
  };

  // Results analysis handlers
  const loadResults = async () => {
    try {
      setLoadingResults(true);
      const resultsData = await api.evaluations.getResults(decisionId);
      setResults(resultsData);
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoadingResults(false);
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

                {!showCriteriaForm && criteria.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No criteria defined yet</p>
                    <Button onClick={() => setShowCriteriaForm(true)}>+ Add Criteria</Button>
                  </div>
                ) : !showCriteriaForm ? (
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
                    <Button variant="outline" onClick={() => setShowCriteriaForm(true)}>Edit Criteria</Button>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {criteriaFormData.map((criterion, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Criterion Name *
                            </label>
                            <input
                              type="text"
                              value={criterion.name}
                              onChange={(e) => handleCriterionChange(index, 'name', e.target.value)}
                              placeholder="e.g., Customer Satisfaction Impact"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={criterion.description}
                              onChange={(e) => handleCriterionChange(index, 'description', e.target.value)}
                              placeholder="How will this criterion be evaluated?"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weight (0.1 - 5.0)
                              </label>
                              <input
                                type="number"
                                min="0.1"
                                max="5.0"
                                step="0.1"
                                value={criterion.weight}
                                onChange={(e) => handleCriterionChange(index, 'weight', parseFloat(e.target.value) || 1.0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>

                            {criteriaFormData.length > 1 && (
                              <Button
                                variant="outline"
                                onClick={() => handleRemoveCriterion(index)}
                                className="mt-6"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleAddCriterion}>
                        + Add Another Criterion
                      </Button>
                      <Button onClick={handleSaveCriteria}>
                        Save Criteria
                      </Button>
                      <Button variant="outline" onClick={() => setShowCriteriaForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {criteria.length > 0 && !showCriteriaForm && (
                  <Button onClick={() => handlePhaseComplete(2)}>
                    Continue to Options →
                  </Button>
                )}
              </Card>
            )}

            {/* Phase 3: Consider Options */}
            {currentPhase === 3 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">💡 Phase 3: Consider Options</h2>
                <p className="text-gray-600 mb-4">Define possible response options for this customer issue.</p>

                {!showOptionsForm && options.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No options defined yet</p>
                    <Button onClick={() => setShowOptionsForm(true)}>+ Add Options</Button>
                  </div>
                ) : !showOptionsForm ? (
                  <div>
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
                    <Button variant="outline" onClick={() => setShowOptionsForm(true)}>
                      Edit Options
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {optionsFormData.map((option, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Option {index + 1}</h4>
                          {optionsFormData.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title *
                            </label>
                            <input
                              type="text"
                              value={option.title}
                              onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
                              placeholder="e.g., Full refund with apology"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description *
                            </label>
                            <textarea
                              value={option.description}
                              onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                              placeholder="Describe this response option in detail..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Financial Cost ($)
                              </label>
                              <input
                                type="number"
                                value={option.financial_cost}
                                onChange={(e) => handleOptionChange(index, 'financial_cost', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Implementation Effort
                              </label>
                              <select
                                value={option.implementation_effort}
                                onChange={(e) => handleOptionChange(index, 'implementation_effort', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Risk Level
                              </label>
                              <select
                                value={option.risk_level}
                                onChange={(e) => handleOptionChange(index, 'risk_level', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expected Satisfaction Impact (1-5)
                              </label>
                              <input
                                type="number"
                                value={option.estimated_satisfaction_impact}
                                onChange={(e) => handleOptionChange(index, 'estimated_satisfaction_impact', parseInt(e.target.value) || 3)}
                                min="1"
                                max="5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleAddOption}>
                        + Add Another Option
                      </Button>
                      <Button onClick={handleSaveOptions}>
                        Save Options
                      </Button>
                      <Button variant="outline" onClick={() => setShowOptionsForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {!showOptionsForm && options.length > 0 && (
                  <Button onClick={() => handlePhaseComplete(3)} className="mt-4">
                    Continue to Evaluation →
                  </Button>
                )}
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

                {!showEvaluationForm ? (
                  <div>
                    <div className="space-y-3 mb-4">
                      {evaluations.map((evaluation) => (
                        <div key={evaluation.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Anonymous evaluation submitted on {new Date(evaluation.submitted_at).toLocaleDateString()}
                          </p>
                          {evaluation.comments && (
                            <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{evaluation.comments}&rdquo;</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {evaluations.length === 0 && (
                      <p className="text-gray-500 text-sm mb-4">No evaluations submitted yet</p>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={() => setShowEvaluationForm(true)}>
                        + Submit Your Evaluation
                      </Button>
                      {evaluations.length > 0 && (
                        <Button variant="outline" onClick={() => handlePhaseComplete(4)}>
                          Continue to Results →
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Option Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Option to Evaluate *
                      </label>
                      <div className="space-y-2">
                        {options.map((option) => (
                          <div
                            key={option.id}
                            onClick={() => setSelectedOptionForEval(option.id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedOptionForEval === option.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{option.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedOptionForEval === option.id
                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedOptionForEval === option.id && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Criteria Scoring */}
                    {selectedOptionForEval && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Score Against Criteria</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Rate the selected option against each criterion (1-5, where 5 is best)
                        </p>
                        <div className="space-y-4">
                          {criteria.map((criterion) => (
                            <div key={criterion.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                                  {criterion.description && (
                                    <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">Weight: {criterion.weight}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() => handleCriteriaScoreChange(criterion.id, score)}
                                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                                      criteriaScores[criterion.id] === score
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                  >
                                    {score}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional Comments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        value={evaluationComments}
                        onChange={(e) => setEvaluationComments(e.target.value)}
                        placeholder="Share your reasoning, concerns, or additional insights..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button onClick={handleSubmitEvaluation}>
                        Submit Evaluation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEvaluationForm(false);
                          setSelectedOptionForEval('');
                          setCriteriaScores({});
                          setEvaluationComments('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Phase 5: Results Analysis */}
            {currentPhase === 5 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">📊 Phase 5: Results Analysis</h2>
                <p className="text-gray-600 mb-4">Review team consensus and make final decision.</p>

                {!results ? (
                  <div className="text-center py-8">
                    <Button onClick={loadResults} disabled={loadingResults}>
                      {loadingResults ? 'Loading Results...' : 'Load Team Results'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Team Participation Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Team Participation</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700 font-medium">Participation Rate</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {(results.participation_rate * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Team Consensus</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {(results.team_consensus * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Evaluations</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {results.completed_by?.length || 0} / {(results.completed_by?.length || 0) + (results.pending_from?.length || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Option Scores Ranking */}
                    <div>
                      <h3 className="font-semibold mb-3">Ranked Options</h3>
                      <div className="space-y-3">
                        {results.option_scores?.map((optionScore: any, index: number) => {
                          const isRecommended = optionScore.option_id === results.recommended_option;
                          const conflictColor =
                            optionScore.conflict_level === 'high' ? 'bg-red-100 border-red-300' :
                            optionScore.conflict_level === 'medium' ? 'bg-yellow-100 border-yellow-300' :
                            optionScore.conflict_level === 'low' ? 'bg-blue-100 border-blue-300' :
                            'bg-green-100 border-green-300';

                          return (
                            <div
                              key={optionScore.option_id}
                              className={`p-4 border-2 rounded-lg ${
                                isRecommended ? 'border-primary-500 bg-primary-50' : conflictColor
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-500">#{index + 1}</span>
                                    <h4 className="font-semibold">{optionScore.option_title}</h4>
                                    {isRecommended && (
                                      <Badge className="bg-primary-500 text-white">
                                        ⭐ Recommended
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-4 gap-3 mt-3">
                                <div>
                                  <p className="text-xs text-gray-600">Weighted Score</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {optionScore.weighted_score.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Average Score</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {optionScore.average_score.toFixed(1)} / 10
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Consensus</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {(optionScore.consensus * 100).toFixed(0)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Conflict Level</p>
                                  <Badge className={
                                    optionScore.conflict_level === 'high' ? 'bg-red-500' :
                                    optionScore.conflict_level === 'medium' ? 'bg-yellow-500' :
                                    optionScore.conflict_level === 'low' ? 'bg-blue-500' :
                                    'bg-green-500'
                                  }>
                                    {optionScore.conflict_level}
                                  </Badge>
                                </div>
                              </div>

                              <div className="mt-3 text-xs text-gray-600">
                                Evaluated by {optionScore.evaluators} team member{optionScore.evaluators !== 1 ? 's' : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pending Evaluations Warning */}
                    {results.pending_from && results.pending_from.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-yellow-900 font-medium">⚠️ Pending Evaluations</p>
                        <p className="text-sm text-yellow-800 mt-1">
                          Waiting for evaluations from: {results.pending_from.join(', ')}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={() => loadResults()} variant="outline">
                        Refresh Results
                      </Button>
                      <Button onClick={() => handlePhaseComplete(5)}>
                        Complete Decision →
                      </Button>
                    </div>
                  </div>
                )}
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
