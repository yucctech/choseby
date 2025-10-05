'use client';

import { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveLayout, PageHeader } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DecisionPhaseProgress } from '@/components/ui/Progress';
import { DashboardDesktop } from './DashboardDesktop';
import { apiClient } from '@/lib/api-client';
import type { Decision, Team, User } from '@/types';
import { clsx } from 'clsx';

interface DashboardProps {
  user: User;
  team: Team;
  onCreateDecision: () => void;
  onViewDecision: (decisionId: string) => void;
}

export function Dashboard({ user, team, onCreateDecision, onViewDecision }: DashboardProps) {
  const { deviceType, isMobile, isTablet, isDesktop } = useResponsive();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecisions();
  }, [team.id]);

  const loadDecisions = async () => {
    try {
      setLoading(true);

      // Mock decisions for demo mode
      const mockDecisions: Decision[] = [
        {
          id: 'decision-1',
          team_id: team.id,
          title: 'New Ventilator Protocol Implementation',
          description: 'Standardize ventilator protocols across ICU units',
          status: 'in_progress',
          workflow_type: 'full_decide',
          current_phase: 1,
          decision_type: 'clinical',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'decision-2',
          team_id: team.id,
          title: 'Emergency Department Staffing Model',
          description: 'Optimize ED staffing for peak hours',
          status: 'in_progress',
          workflow_type: 'express',
          current_phase: 4,
          decision_type: 'strategic',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'decision-3',
          team_id: team.id,
          title: 'Patient Monitoring System Upgrade',
          description: 'Select new patient monitoring vendor',
          status: 'completed',
          workflow_type: 'full_decide',
          current_phase: 6,
          decision_type: 'vendor_selection',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setDecisions(mockDecisions);

      // Try real API in background
      apiClient.getDecisions(team.id)
        .then(data => setDecisions(data))
        .catch(() => console.log('Using mock decisions'));
    } catch (error) {
      console.error('Failed to load decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeDecisions = decisions.filter(d => d.status === 'active' || d.status === 'in_progress' || d.status === 'emergency');
  const completedDecisions = decisions.filter(d => d.status === 'completed');

  if (isMobile) {
    return <DashboardMobile decisions={activeDecisions} user={user} team={team} onCreateDecision={onCreateDecision} onViewDecision={onViewDecision} />;
  }

  if (isTablet) {
    return <DashboardTablet decisions={activeDecisions} user={user} team={team} onCreateDecision={onCreateDecision} onViewDecision={onViewDecision} />;
  }

  return <DashboardDesktop decisions={activeDecisions} completed={completedDecisions} user={user} team={team} onCreateDecision={onCreateDecision} onViewDecision={onViewDecision} />;
}

function DashboardMobile({ decisions, user, team, onCreateDecision, onViewDecision }: {
  decisions: Decision[];
  user: User;
  team: Team;
  onCreateDecision: () => void;
  onViewDecision: (id: string) => void;
}) {
  return (
    <ResponsiveLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Welcome back,</div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <div className="text-sm text-gray-500">{team.name}</div>
          </div>
          <Button onClick={onCreateDecision} size="sm">
            + New
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-900">📊 Active Decisions</div>
          <div className="text-2xl font-bold text-blue-600">{decisions.length}</div>
        </div>

        <div className="space-y-3">
          {decisions.map((decision) => (
            <Card key={decision.id} variant={decision.status === 'emergency' ? 'emergency' : 'default'} padding="sm">
              {decision.status === 'emergency' && (
                <Badge variant="emergency" className="mb-2">
                  🚨 EMERGENCY
                </Badge>
              )}
              <h3 className="font-semibold text-gray-900 mb-1">{decision.title}</h3>
              <div className="text-sm text-gray-600 mb-2">
                Phase {decision.current_phase}/6
              </div>
              <DecisionPhaseProgress currentPhase={decision.current_phase} variant="mobile" />
              <Button onClick={() => onViewDecision(decision.id)} size="sm" fullWidth className="mt-3">
                View Decision →
              </Button>
            </Card>
          ))}
        </div>

        <div className="fixed bottom-4 left-4 right-4">
          <Button onClick={onCreateDecision} fullWidth size="lg" variant="primary">
            + New Decision
          </Button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function DashboardTablet({ decisions, user, team, onCreateDecision, onViewDecision }: {
  decisions: Decision[];
  user: User;
  team: Team;
  onCreateDecision: () => void;
  onViewDecision: (id: string) => void;
}) {
  return (
    <ResponsiveLayout>
      <PageHeader
        title={`Welcome back, ${user.name}`}
        subtitle={`${team.name} - ${user.role}`}
        action={
          <Button onClick={onCreateDecision} size="md">
            + New Decision
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Decisions ({decisions.length})</h2>
          {decisions.map((decision) => (
            <Card key={decision.id} variant={decision.status === 'emergency' ? 'emergency' : 'elevated'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {decision.status === 'emergency' && (
                      <Badge variant="emergency" className="mb-2">
                        🚨 EMERGENCY
                      </Badge>
                    )}
                    <CardTitle>{decision.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{decision.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <DecisionPhaseProgress currentPhase={decision.current_phase} variant="tablet" />
                  <Button onClick={() => onViewDecision(decision.id)} fullWidth>
                    Continue →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <Card>
            <CardContent className="space-y-2">
              <Button onClick={onCreateDecision} fullWidth variant="primary">
                + New Emergency Decision
              </Button>
              <Button onClick={onCreateDecision} fullWidth variant="secondary">
                + New Express Decision
              </Button>
              <Button onClick={onCreateDecision} fullWidth variant="secondary">
                + New Full DECIDE
              </Button>
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold text-gray-900">Team Status</h3>
          <Card>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Members</span>
                  <span className="font-medium">{team.member_count || 8}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Decisions</span>
                  <span className="font-medium">{decisions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

