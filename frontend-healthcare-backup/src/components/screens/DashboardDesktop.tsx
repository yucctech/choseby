'use client';

import { ResponsiveLayout, PageHeader } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DecisionPhaseProgress } from '@/components/ui/Progress';
import type { Decision, Team, User } from '@/types';

interface DashboardDesktopProps {
  decisions: Decision[];
  completed: Decision[];
  user: User;
  team: Team;
  onCreateDecision: () => void;
  onViewDecision: (id: string) => void;
}

export function DashboardDesktop({ decisions, completed, user, team, onCreateDecision, onViewDecision }: DashboardDesktopProps) {
  const conflictDecisions = decisions.filter(d => d.status === 'emergency');
  const currentTime = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <ResponsiveLayout className="max-w-[1600px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">🏥 ChoseBy Healthcare Dashboard</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">Profile</Button>
            <Button size="sm" variant="ghost">Team Management</Button>
            <Button size="sm" variant="ghost">Settings</Button>
            <Button size="sm" variant="ghost">Reports</Button>
            <Button size="sm" variant="secondary">Logout</Button>
          </div>
        </div>
        <p className="text-gray-600">
          {team.name} - {user.name}, {user.role} | 📅 {currentTime}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Active Decisions</h2>

          {decisions.map((decision) => {
            const hasConflicts = decision.status === 'emergency';

            return (
              <Card key={decision.id} variant={hasConflicts ? 'emergency' : 'elevated'}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {hasConflicts && (
                      <Badge variant="emergency">🚨 HIGH PRIORITY</Badge>
                    )}
                    <Badge variant="info" size="sm">{decision.decision_type?.toUpperCase() || 'DECIDE'}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">{decision.title}</h3>
                  <p className="text-sm text-gray-600">Phase {decision.current_phase}/6 - Anonymous Team Evaluation</p>

                  {hasConflicts && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-800">⚠️ CONFLICTS DETECTED (2 team members)</p>
                      <p className="text-xs text-red-600 mt-1">Progress: 6/8 evaluations complete</p>
                      <p className="text-xs text-red-600">Estimated resolution: Today 5:00 PM</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    {decision.description || 'No description provided'}
                  </div>

                  <DecisionPhaseProgress currentPhase={decision.current_phase} variant="desktop" />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                      Created {new Date(decision.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {hasConflicts && (
                        <Button size="sm" variant="danger">
                          VIEW CONFLICT DETAILS
                        </Button>
                      )}
                      <Button size="sm" variant="primary" onClick={() => onViewDecision(decision.id)}>
                        {hasConflicts ? 'FACILITATE DISCUSSION' : 'CONTINUE WORKFLOW'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {completed.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mt-6">Recently Completed</h3>
              {completed.slice(0, 2).map((decision) => (
                <Card key={decision.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-medium text-gray-900">{decision.title}</span>
                      </div>
                      <p className="text-sm text-gray-500">Phase 6/6 - Monitor Results</p>
                      <p className="text-sm text-green-600">✅ 94% compliance achieved</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">VIEW FINAL REPORT</Button>
                      <Button size="sm" variant="ghost">ARCHIVE DECISION</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>

        <div className="col-span-4 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Team Analytics</h2>

          <Card>
            <CardHeader>
              <CardTitle>📊 Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-600">Decision Velocity</span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: '72%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-600">Conflict Resolution Rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-600">Team Satisfaction</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '87%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👥 Team Status (Real-time)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">{user.name} (Leading meeting)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Nurse Johnson (On rounds)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Dr. Williams (Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Dr. Martinez (In clinic)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm">Nurse Thompson (Busy)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Admin Chen (Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Dr. Patel (Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Supervisor Davis (Available)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>

          <Card padding="sm">
            <div className="space-y-2">
              <Button onClick={onCreateDecision} fullWidth variant="emergency">
                + Emergency Decision
              </Button>
              <Button onClick={onCreateDecision} fullWidth variant="primary">
                + Express Decision
              </Button>
              <Button onClick={onCreateDecision} fullWidth variant="secondary">
                + Full DECIDE Method
              </Button>
              <Button onClick={onCreateDecision} fullWidth variant="ghost">
                Join Existing Decision
              </Button>
            </div>
          </Card>

          <Card padding="sm">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">🔍 Search Decisions</p>
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Card>

          <Card padding="sm">
            <p className="text-sm font-medium text-gray-700 mb-2">📁 Templates</p>
            <div className="space-y-1">
              <button className="text-sm text-gray-600 hover:text-blue-600 block w-full text-left">• Clinical Protocol Review</button>
              <button className="text-sm text-gray-600 hover:text-blue-600 block w-full text-left">• Staffing Decision</button>
              <button className="text-sm text-gray-600 hover:text-blue-600 block w-full text-left">• Equipment Purchase</button>
              <button className="text-sm text-gray-600 hover:text-blue-600 block w-full text-left">• Policy Update</button>
            </div>
          </Card>

          <Card padding="sm">
            <p className="text-sm font-medium text-gray-700 mb-2">📊 Reports</p>
            <div className="space-y-2">
              <Button size="sm" fullWidth variant="ghost">Generate Team Report</Button>
              <Button size="sm" fullWidth variant="ghost">Export Decision History</Button>
              <Button size="sm" fullWidth variant="ghost">Compliance Audit Trail</Button>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6" variant="outlined">
        <CardHeader>
          <CardTitle>Recent Activity & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <Badge variant="emergency" size="sm">URGENT</Badge>
            <p className="text-sm text-gray-700">Dr. Williams completed evaluation for Ventilator Protocol - conflicts detected with Dr. Martinez <span className="text-gray-500">(2 minutes ago)</span></p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="success" size="sm">✅</Badge>
            <p className="text-sm text-gray-700">Nurse Johnson successfully added clinical criteria to Staffing Model Change decision <span className="text-gray-500">(15 minutes ago)</span></p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="warning" size="sm">⚠️</Badge>
            <p className="text-sm text-gray-700">ALERT: Automated conflict detection triggered for Ventilator Protocol - variance threshold exceeded <span className="text-gray-500">(45 minutes ago)</span></p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="info" size="sm">📝</Badge>
            <p className="text-sm text-gray-700">Dr. Smith created new decision: Emergency Equipment Purchase Review - Priority: Medium <span className="text-gray-500">(2 hours ago)</span></p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="ghost">View All Activity</Button>
            <Button size="sm" variant="ghost">Configure Notifications</Button>
            <Button size="sm" variant="ghost">Export Activity Log</Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveLayout>
  );
}