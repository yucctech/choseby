'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api-client';
import type { DashboardMetrics, CustomerDecision } from '@/types';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<CustomerDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get actual team ID from auth context
  const teamId = 'demo-team-id';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load dashboard data (includes metrics and recent decisions)
        const dashboardData = await api.analytics.getDashboard();

        // Map to metrics format
        setMetrics({
          totalDecisions: dashboardData.summary?.total_decisions || 0,
          inProgress: dashboardData.summary?.total_decisions || 0,
          avgResponseTimeHours: dashboardData.summary?.avg_resolution_hours || 0,
          customerSatisfactionAvg: dashboardData.summary?.avg_satisfaction || 0,
          recentDecisions: dashboardData.recent_activity || [],
        });

        // Recent activity from analytics already has the data we need
        const recentActivity = dashboardData.recent_activity || [];
        setRecentDecisions(recentActivity);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return 'bg-urgency-critical text-white';
    if (level >= 3) return 'bg-urgency-high text-white';
    if (level >= 2) return 'bg-urgency-medium text-white';
    return 'bg-urgency-low text-white';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Response Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage customer response decisions and track team performance</p>
            </div>
            <Link href="/decisions/new">
              <Button size="lg">
                + New Decision
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Decisions</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.total_decisions || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{metrics?.decisions_in_progress || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                <p className="text-3xl font-bold text-green-600">{metrics?.avg_response_time_hours?.toFixed(1) || 0}h</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Satisfaction</p>
                <p className="text-3xl font-bold text-purple-600">{metrics?.avg_customer_satisfaction?.toFixed(1) || 0}/5</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Decisions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Decisions</h2>
            <Link href="/decisions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentDecisions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No decisions yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first customer response decision</p>
              <Link href="/decisions/new">
                <Button>
                  Create First Decision
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDecisions.map((decision) => (
                <Link key={decision.id} href={`/decisions/${decision.id}`}>
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{decision.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{decision.description}</p>
                      </div>
                      <Badge className={getStatusColor(decision.status)}>
                        {decision.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Customer:</span>
                        <span>{decision.customer_name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-medium">Tier:</span>
                        <Badge className="text-xs" style={{ backgroundColor: `var(--tier-${decision.customer_tier})` }}>
                          {decision.customer_tier}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-medium">Urgency:</span>
                        <Badge className={`text-xs ${getUrgencyColor(decision.urgency_level)}`}>
                          Level {decision.urgency_level}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-medium">Type:</span>
                        <span className="text-xs">{decision.decision_type}</span>
                      </div>

                      <div className="flex items-center gap-1 ml-auto">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(decision.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/decisions/new">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">New Decision</h3>
                <p className="text-sm text-gray-600">Start a new customer response decision workflow</p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/analytics">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
                <p className="text-sm text-gray-600">Track response times and customer satisfaction</p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/team">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Team</h3>
                <p className="text-sm text-gray-600">Add members and configure permissions</p>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
