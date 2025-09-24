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

interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  responsibility: string;
}

interface ActionPlanningProps {
  decision: Decision;
  selectedOption: string;
  onBack: () => void;
  onContinue: () => void;
}

export function ActionPlanning({ decision, selectedOption, onBack, onContinue }: ActionPlanningProps) {
  const { isMobile, isTablet } = useResponsive();
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'Training materials complete', date: '2025-03-15', completed: true, responsibility: 'Dr. Smith' },
    { id: '2', title: 'Pilot launch', date: '2025-03-30', completed: true, responsibility: 'Nurse Johnson' },
    { id: '3', title: 'Full implementation', date: '2025-04-15', completed: false, responsibility: 'Dr. Williams' },
    { id: '4', title: 'First review', date: '2025-05-01', completed: false, responsibility: 'Dr. Smith' }
  ]);
  const [actionPlan, setActionPlan] = useState('Week 1-2: Staff training\nWeek 3-4: Pilot program\nWeek 5-8: Full rollout\nWeek 9-12: Monitor & adjust');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setLoading(true);
      onContinue();
      apiClient.updateDecision(decision.team_id, decision.id, { current_phase: 6 }).catch(() => console.log('Demo mode'));
    } catch (error) {
      console.error('Failed to save action plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <ResponsiveLayout>
        <PageHeader
          title="Develop Action Plan"
          subtitle="DECIDE Progress (5/6)"
          onBack={onBack}
        />

        <DecisionPhaseProgress currentPhase={5} variant="mobile" />

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📅 Selected Option</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{selectedOption}</p>
              <p className="text-sm text-gray-600 mt-1">(Based on team evaluation)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline & Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={m.completed}
                    onChange={(e) => setMilestones(milestones.map(mi =>
                      mi.id === m.id ? { ...mi, completed: e.target.checked } : mi
                    ))}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.title}: {m.date}</p>
                    <p className="text-xs text-gray-600">{m.responsibility}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={onBack} variant="secondary" fullWidth>Save Draft</Button>
            <Button onClick={handleContinue} variant="primary" fullWidth loading={loading}>
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
          title="Phase 5: Action Planning"
          subtitle="Progress: 5/6"
          onBack={onBack}
          action={<DecisionPhaseProgress currentPhase={5} variant="tablet" />}
        />

        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📅 Implementation Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">SELECTED: {selectedOption}</p>
              </div>

              {[
                { phase: 'Phase 1: Preparation', weeks: 'Week 1-2', dates: 'Mar 1-15', progress: 100 },
                { phase: 'Phase 2: Pilot Program', weeks: 'Week 3-4', dates: 'Mar 15-30', progress: 100 },
                { phase: 'Phase 3: Full Rollout', weeks: 'Week 5-8', dates: 'Apr 1-15', progress: 60 },
                { phase: 'Phase 4: Monitor & Optimize', weeks: 'Week 9-12', dates: 'Apr 15-May', progress: 0 }
              ].map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.phase}</span>
                    <span className="text-gray-600">{p.dates}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👥 Team Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">Project Lead:</p>
                <p className="text-sm text-gray-600">Dr. Smith (ICU Lead)</p>
                <p className="text-xs text-gray-500">• Overall coordination</p>
              </div>
              <div>
                <p className="font-medium">Training Coordinator:</p>
                <p className="text-sm text-gray-600">Nurse Johnson (Charge)</p>
                <p className="text-xs text-gray-500">• Staff education</p>
              </div>
              <div>
                <p className="font-medium">Quality Assurance:</p>
                <p className="text-sm text-gray-600">Dr. Williams (Attending)</p>
                <p className="text-xs text-gray-500">• Protocol compliance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="secondary">Back</Button>
          <Button onClick={handleContinue} variant="primary" loading={loading}>
            Continue to Monitoring →
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
            <h1 className="text-2xl font-bold">Phase 5: Develop Action Plan</h1>
          </div>
          <div className="flex items-center gap-4">
            <DecisionPhaseProgress currentPhase={5} variant="desktop" />
            <Button variant="ghost" size="sm">Templates</Button>
            <Button variant="ghost" size="sm">Export</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 COMPREHENSIVE ACTION PLAN</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Selected: {selectedOption}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />

              <div className="space-y-3 pt-4 border-t">
                <p className="font-medium">📅 DETAILED TIMELINE:</p>
                {[
                  { phase: 'Foundation', dates: 'March 1-15, 2025', desc: 'Training material development, system setup', progress: 100 },
                  { phase: 'Pilot Implementation', dates: 'March 15-30', desc: 'Core team training, Unit A pilot', progress: 100 },
                  { phase: 'Full Deployment', dates: 'April 1-15', desc: 'All-staff training, full ICU rollout', progress: 60 },
                  { phase: 'Optimization', dates: 'April 15 - May 15', desc: 'Performance monitoring, refinement', progress: 0 }
                ].map((p, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Phase {i + 1}: {p.phase}</span>
                      <Badge variant={p.progress === 100 ? 'success' : p.progress > 0 ? 'warning' : 'default'} size="sm">
                        {p.progress}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{p.dates} - {p.desc}</p>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>👥 TEAM & RESOURCES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-sm mb-2">📊 Budget Allocation:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Training: $15,000</span>
                    <span className="text-gray-600">(33%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technology: $20,000</span>
                    <span className="text-gray-600">(44%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monitoring: $10,000</span>
                    <span className="text-gray-600">(23%)</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total Budget:</span>
                    <span>$45,000</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="font-medium text-sm mb-2">👥 Staffing:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Project Lead: 0.5 FTE</p>
                  <p>• Training Coord: 0.25 FTE</p>
                  <p>• QA Specialist: 0.25 FTE</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Success Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✅ {'>'} 90% protocol compliance</p>
              <p>✅ 15% patient outcome improvement</p>
              <p>✅ {'<'}5% protocol deviations</p>
              <p>✅ 85% staff satisfaction</p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>⚠️ RISK MANAGEMENT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Badge variant="danger" size="sm">HIGH RISK</Badge>
                <p className="text-xs text-gray-600 mt-1">• Staff resistance to change</p>
                <p className="text-xs text-gray-600">• Implementation during flu season</p>
              </div>
              <div>
                <Badge variant="warning" size="sm">MEDIUM RISK</Badge>
                <p className="text-xs text-gray-600 mt-1">• Technology integration issues</p>
                <p className="text-xs text-gray-600">• Timeline delays</p>
              </div>
              <div>
                <Badge variant="success" size="sm">LOW RISK</Badge>
                <p className="text-xs text-gray-600 mt-1">• Team buy-in (achieved)</p>
                <p className="text-xs text-gray-600">• Regulatory approval</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="secondary">Save Plan</Button>
        <Button onClick={handleContinue} variant="primary" size="lg" loading={loading}>
          Continue to Phase 6: Monitor Results →
        </Button>
      </div>
    </ResponsiveLayout>
  );
}