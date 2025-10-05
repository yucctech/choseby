'use client';

import { useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveLayout, PageHeader } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DecisionPhaseProgress } from '@/components/ui/Progress';
import type { Decision } from '@/types';

interface MetricData {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'success' | 'warning' | 'danger';
}

interface ReviewSchedule {
  id: string;
  date: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  completed: boolean;
  findings?: string;
}

interface MonitorResultsProps {
  decision: Decision;
  onBack: () => void;
  onComplete: () => void;
}

export function MonitorResults({ decision, onBack, onComplete }: MonitorResultsProps) {
  const { isMobile, isTablet } = useResponsive();
  const [metrics] = useState<MetricData[]>([
    { id: '1', name: 'Patient Outcomes', current: 94, target: 90, unit: '%', trend: 'up', status: 'success' },
    { id: '2', name: 'Staff Satisfaction', current: 87, target: 85, unit: '%', trend: 'up', status: 'success' },
    { id: '3', name: 'Protocol Compliance', current: 96, target: 95, unit: '%', trend: 'stable', status: 'success' },
    { id: '4', name: 'Cost Savings', current: 47000, target: 45000, unit: '$', trend: 'up', status: 'success' }
  ]);
  const [reviews] = useState<ReviewSchedule[]>([
    { id: '1', date: '2025-04-07', type: 'weekly', completed: true, findings: 'On track - minor adjustments to training' },
    { id: '2', date: '2025-04-14', type: 'weekly', completed: true, findings: 'Excellent progress - staff adoption at 95%' },
    { id: '3', date: '2025-04-21', type: 'weekly', completed: false },
    { id: '4', date: '2025-05-01', type: 'monthly', completed: false }
  ]);

  if (isMobile) {
    return (
      <ResponsiveLayout>
        <PageHeader
          title="Monitor Results"
          subtitle="DECIDE Progress (6/6)"
          onBack={onBack}
        />

        <DecisionPhaseProgress currentPhase={6} variant="mobile" />

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 Success Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.map((metric) => (
                <div key={metric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge variant={metric.status} size="sm">
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current: {metric.current}{metric.unit === '$' ? '' : metric.unit}</span>
                    <span className="text-gray-600">Target: {metric.target}{metric.unit === '$' ? '' : metric.unit}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${metric.status === 'success' ? 'bg-green-600' : metric.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📅 Review Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-2">
                  <input type="checkbox" checked={review.completed} readOnly className="mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review - {new Date(review.date).toLocaleDateString()}
                    </p>
                    {review.findings && (
                      <p className="text-xs text-gray-600 mt-1">{review.findings}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={onBack} variant="secondary" fullWidth>Back</Button>
            <Button onClick={onComplete} variant="primary" fullWidth>
              Complete Decision ✓
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
          title="Phase 6: Monitor Results"
          subtitle="Progress: 6/6"
          onBack={onBack}
          action={<DecisionPhaseProgress currentPhase={6} variant="tablet" />}
        />

        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Success Metrics Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{metric.name}</span>
                    <Badge variant={metric.status}>
                      {metric.current}{metric.unit === '$' ? 'K' : metric.unit}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${metric.status === 'success' ? 'bg-green-600' : 'bg-yellow-600'}`}
                        style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                      {' '}{Math.round((metric.current / metric.target) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Target: {metric.target}{metric.unit === '$' ? 'K' : metric.unit}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📅 Review Schedule & Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className={`p-3 rounded-lg ${review.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review
                    </span>
                    <Badge variant={review.completed ? 'success' : 'default'} size="sm">
                      {review.completed ? '✓ Done' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{new Date(review.date).toLocaleDateString()}</p>
                  {review.findings && (
                    <p className="text-sm text-gray-700 mt-2">{review.findings}</p>
                  )}
                </div>
              ))}
              <Button size="sm" fullWidth variant="secondary">
                Schedule Next Review
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="secondary">Back</Button>
          <Button onClick={onComplete} variant="primary">
            Complete Decision & Archive →
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
            <h1 className="text-2xl font-bold">Phase 6: Monitor & Evaluate Results</h1>
          </div>
          <div className="flex items-center gap-4">
            <DecisionPhaseProgress currentPhase={6} variant="desktop" />
            <Button variant="ghost" size="sm">Export Report</Button>
            <Button variant="secondary" size="sm">Share Results</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 REAL-TIME PERFORMANCE DASHBOARD</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Live metrics tracking across all success criteria</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {metrics.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{metric.name}</h3>
                      <Badge variant={metric.status}>
                        {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{metric.unit === '$' ? '$' : ''}{metric.current / (metric.unit === '$' ? 1000 : 1)}{metric.unit === '$' ? 'K' : metric.unit}</span>
                      <span className="text-sm text-gray-600">/ {metric.target}{metric.unit === '$' ? 'K' : metric.unit} target</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${metric.status === 'success' ? 'bg-green-600' : metric.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {Math.round((metric.current / metric.target) * 100)}% of target achieved
                      {metric.current > metric.target ? ' (exceeding!)' : ''}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">📈 TREND ANALYSIS (Last 30 Days)</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="font-bold text-green-700">+8%</p>
                    <p className="text-xs text-gray-600">Patient Outcomes</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="font-bold text-green-700">+12%</p>
                    <p className="text-xs text-gray-600">Staff Satisfaction</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <p className="font-bold text-blue-700">+1%</p>
                    <p className="text-xs text-gray-600">Compliance</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="font-bold text-green-700">$47K</p>
                    <p className="text-xs text-gray-600">Cost Savings</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">🎯 CONTINUOUS IMPROVEMENT RECOMMENDATIONS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <p>Staff training completion at 95% - consider advanced certification program</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <p>Patient outcomes trending 4% above target - document best practices</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">→</span>
                    <p>Consider extending protocol to Emergency Department based on ICU success</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">!</span>
                    <p>Monitor night shift compliance - slightly below day shift performance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📅 REVIEW SCHEDULE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className={`p-3 rounded-lg ${review.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={review.completed ? 'success' : 'default'} size="sm">
                      {review.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-600">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  {review.findings && (
                    <p className="text-sm text-gray-700 mt-2">{review.findings}</p>
                  )}
                  {!review.completed && (
                    <Button size="sm" variant="ghost" fullWidth className="mt-2">
                      Conduct Review
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" fullWidth variant="secondary">
                + Schedule Additional Review
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏆 DECISION OUTCOMES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-green-700">✓ Patient Safety: IMPROVED</p>
                <p className="text-xs text-gray-600 mt-1">Zero protocol violations, 94% compliance rate</p>
              </div>
              <div>
                <p className="font-medium text-green-700">✓ Staff Satisfaction: POSITIVE</p>
                <p className="text-xs text-gray-600 mt-1">87% positive feedback, high adoption</p>
              </div>
              <div>
                <p className="font-medium text-green-700">✓ Financial Impact: ON TARGET</p>
                <p className="text-xs text-gray-600 mt-1">$47K savings vs $45K target</p>
              </div>
              <div className="pt-3 border-t">
                <p className="font-medium">📊 Overall Success Rate:</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: '96%' }} />
                  </div>
                  <span className="font-bold text-green-700">96%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="text-sm">
              <p className="font-medium mb-2">📝 Next Steps:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Document lessons learned</li>
                <li>• Share success with leadership</li>
                <li>• Plan phase 2 expansion</li>
                <li>• Archive decision for reference</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="secondary">Back to Action Plan</Button>
        <Button onClick={onComplete} variant="primary" size="lg">
          Complete Decision & Archive →
        </Button>
      </div>
    </ResponsiveLayout>
  );
}