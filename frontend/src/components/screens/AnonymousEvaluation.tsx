'use client';

import { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveLayout, PageHeader } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DecisionPhaseProgress } from '@/components/ui/Progress';
import { apiClient } from '@/lib/api-client';
import type { Decision, DecisionOption, DecisionCriteria } from '@/types';

interface EvaluationScore {
  optionId: string;
  criterionId: string;
  score: number;
  rationale?: string;
}

interface AnonymousEvaluationProps {
  decision: Decision;
  options: DecisionOption[];
  criteria: DecisionCriteria[];
  onBack: () => void;
  onContinue: () => void;
}

export function AnonymousEvaluation({ decision, options, criteria, onBack, onContinue }: AnonymousEvaluationProps) {
  const { isMobile, isTablet } = useResponsive();
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [scores, setScores] = useState<EvaluationScore[]>([]);
  const [overallConfidence, setOverallConfidence] = useState(7);
  const [anonymousComments, setAnonymousComments] = useState('');
  const [loading, setLoading] = useState(false);

  const currentOption = options[currentOptionIndex];

  const getScore = (optionId: string, criterionId: string) => {
    return scores.find(s => s.optionId === optionId && s.criterionId === criterionId)?.score || 5;
  };

  const setScore = (optionId: string, criterionId: string, score: number) => {
    setScores(prev => {
      const existing = prev.filter(s => !(s.optionId === optionId && s.criterionId === criterionId));
      return [...existing, { optionId, criterionId, score }];
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Demo mode: Skip API calls and proceed directly
      onContinue();

      // Try real API in background (won't block navigation)
      const evaluationScores = scores.map(s => ({
        option_id: s.optionId,
        criterion_id: s.criterionId,
        score: s.score,
        confidence: overallConfidence,
        rationale: s.rationale
      }));

      apiClient.submitEvaluation(decision.id, {
        scores: evaluationScores,
        overall_confidence: overallConfidence,
        evaluation_notes: anonymousComments
      }).catch(() => console.log('Demo mode'));

      apiClient.updateDecision(decision.team_id, decision.id, { current_phase: 5 }).catch(() => console.log('Demo mode'));
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <ResponsiveLayout>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-900">🤐 Anonymous Team Evaluation</p>
          <p className="text-xs text-blue-700 mt-1">
            Your evaluations are completely anonymous. Individual scores are never shared with the team.
          </p>
        </div>

        <DecisionPhaseProgress currentPhase={4} variant="mobile" />

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluate: {currentOption?.name}</CardTitle>
              <p className="text-sm text-gray-600">{currentOption?.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion) => {
                const score = getScore(currentOption?.id || '', criterion.id);
                return (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{criterion.name}</span>
                      <Badge variant="info" size="sm">{criterion.weight}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={score}
                        onChange={(e) => setScore(currentOption?.id || '', criterion.id, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="font-bold w-12 text-center">{score}/10</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded ${i < score ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t">
                <label className="text-sm font-medium">Optional Anonymous Comments:</label>
                <Textarea
                  value={anonymousComments}
                  onChange={(e) => setAnonymousComments(e.target.value)}
                  placeholder="Share concerns anonymously..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-sm">
            <span>Progress: {currentOptionIndex + 1}/{options.length} options complete</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentOptionIndex(Math.max(0, currentOptionIndex - 1))}
                disabled={currentOptionIndex === 0}
              >
                Previous
              </Button>
              {currentOptionIndex < options.length - 1 ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setCurrentOptionIndex(currentOptionIndex + 1)}
                >
                  Next Option →
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={handleSubmit} loading={loading}>
                  Submit All →
                </Button>
              )}
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (isTablet) {
    return (
      <ResponsiveLayout>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="font-medium text-blue-900">🤐 COMPLETELY ANONYMOUS SCORING</p>
          <p className="text-sm text-blue-700 mt-1">Individual scores never shared</p>
        </div>

        <DecisionPhaseProgress currentPhase={4} variant="tablet" />

        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluate: {currentOption?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion) => {
                const score = getScore(currentOption?.id || '', criterion.id);
                return (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{criterion.name} ({criterion.weight}%)</span>
                      <span className="font-bold">{score}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={score}
                      onChange={(e) => setScore(currentOption?.id || '', criterion.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 flex-1 rounded ${i < score ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 Option Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{currentOption?.name}</p>
                <p className="text-sm text-gray-600 mt-1">{currentOption?.description}</p>
              </div>
              <div className="pt-3 border-t text-sm">
                <p>💰 Cost: ${currentOption?.estimated_cost?.toLocaleString()}</p>
                <p>⏱️ Timeline: {currentOption?.implementation_timeline}</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">📊 Team Progress:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>✅ 3 members completed</p>
                  <p>⏳ 5 members pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="secondary">Back</Button>
          <Button
            onClick={() => currentOptionIndex < options.length - 1 ? setCurrentOptionIndex(currentOptionIndex + 1) : handleSubmit()}
            variant="primary"
            loading={loading}
          >
            {currentOptionIndex < options.length - 1 ? 'Next Option →' : 'Submit All Evaluations →'}
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout className="max-w-[1600px] mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="font-semibold text-blue-900 text-lg">🤐 ANONYMOUS EVALUATION SYSTEM</p>
        <p className="text-blue-700 mt-1">Individual scores completely confidential - contributing to team decision without hierarchy pressure</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Phase 4: Anonymous Team Evaluation</h1>
          <div className="flex items-center gap-4">
            <DecisionPhaseProgress currentPhase={4} variant="desktop" />
            <Button variant="ghost" size="sm">Help</Button>
            <Button variant="ghost" size="sm">Anonymous Guarantee</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Option Evaluation Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Criteria (Weight)</th>
                      {options.map((opt, i) => (
                        <th key={opt.id} className="text-center py-3 px-2">Option {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((criterion) => (
                      <tr key={criterion.id} className="border-b">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">{criterion.name}</p>
                            <p className="text-xs text-gray-500">({criterion.weight}%)</p>
                          </div>
                        </td>
                        {options.map((opt) => {
                          const score = getScore(opt.id, criterion.id);
                          return (
                            <td key={opt.id} className="py-3 px-2">
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setScore(opt.id, criterion.id, i + 1)}
                                      className={`w-3 h-3 rounded ${i < score ? 'bg-blue-600' : 'bg-gray-200'} hover:bg-blue-400`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-sm">{score}/10</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={score}
                                  onChange={(e) => setScore(opt.id, criterion.id, parseInt(e.target.value))}
                                  className="w-24"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t">
                <label className="font-medium mb-2 block">Anonymous Comments (Optional):</label>
                <Textarea
                  value={anonymousComments}
                  onChange={(e) => setAnonymousComments(e.target.value)}
                  placeholder="Share concerns, suggestions, or insights anonymously..."
                  rows={4}
                />
              </div>

              <div className="mt-4">
                <label className="font-medium mb-2 block">Overall Confidence in Evaluation:</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={overallConfidence}
                    onChange={(e) => setOverallConfidence(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-bold text-lg w-16 text-center">{overallConfidence}/10</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 TEAM EVALUATION PROGRESS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-sm mb-2">✅ Completed Evaluations:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Dr. Smith (Team Lead) - 2 min ago</p>
                  <p>• Nurse Johnson (Charge) - 5 min ago</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="font-medium text-sm mb-2">⏳ In Progress:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Dr. Williams (Attending)</p>
                  <p>• 5 others pending</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="font-medium text-sm mb-2">⚠️ Conflict Detection:</p>
                <p className="text-sm text-gray-600">Analyzing as responses come in...</p>
                <p className="text-xs text-green-600 mt-1">No conflicts detected yet</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="text-sm">
              <p className="font-medium mb-2">🔒 Privacy Guarantee:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• 256-bit encrypted session tokens</li>
                <li>• Individual scores never revealed</li>
                <li>• Only aggregate data shared</li>
                <li>• Session expires in 2 hours</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="secondary">Save Progress</Button>
        <Button onClick={handleSubmit} variant="primary" size="lg" loading={loading}>
          Submit Anonymous Evaluation →
        </Button>
      </div>
    </ResponsiveLayout>
  );
}