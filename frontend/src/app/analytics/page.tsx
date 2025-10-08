'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api-client';
import type { DashboardMetrics, ResponseTimeMetrics, CustomerSatisfactionMetrics, CustomerTier } from '@/types';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.analytics.getDashboard(period);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-600 mt-1">Track customer response performance and team efficiency</p>
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ← Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Decisions</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.summary?.total_decisions || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{period.replace('d', ' days')}</p>
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
                <p className="text-sm text-gray-600 mb-1">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-green-600">{analyticsData?.summary?.avg_resolution_hours?.toFixed(1) || 0}h</p>
                <p className="text-xs text-gray-500 mt-1">Resolution speed</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Satisfaction</p>
                <p className="text-3xl font-bold text-purple-600">{analyticsData?.summary?.avg_satisfaction?.toFixed(1) || 0}/5</p>
                <p className="text-xs text-gray-500 mt-1">Average score</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Team Participation</p>
                <p className="text-3xl font-bold text-blue-600">{analyticsData?.summary?.participation_rate?.toFixed(0) || 0}%</p>
                <p className="text-xs text-gray-500 mt-1">Engagement rate</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Decision Types Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Decision Types</h2>
            <div className="space-y-3">
              {analyticsData?.analytics?.decision_types && Object.entries(analyticsData.analytics.decision_types).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-600">{count} decisions</p>
                  </div>
                  <Badge className="bg-primary-100 text-primary-700">{count}</Badge>
                </div>
              ))}
            </div>

            {(!analyticsData?.analytics?.decision_types || Object.keys(analyticsData.analytics.decision_types).length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No decision type data available for this period</p>
              </div>
            )}
          </Card>

          {/* Urgency Level Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Urgency Distribution</h2>
            <div className="space-y-3">
              {analyticsData?.analytics?.urgency_breakdown && Object.entries(analyticsData.analytics.urgency_breakdown).map(([level, count]: [string, any]) => {
                const urgencyLabels: {[key: string]: string} = {
                  '1': 'Very Low',
                  '2': 'Low',
                  '3': 'Medium',
                  '4': 'High',
                  '5': 'Critical'
                };
                const urgencyColors: {[key: string]: string} = {
                  '1': 'bg-gray-100 text-gray-700',
                  '2': 'bg-blue-100 text-blue-700',
                  '3': 'bg-yellow-100 text-yellow-700',
                  '4': 'bg-orange-100 text-orange-700',
                  '5': 'bg-red-100 text-red-700'
                };
                return (
                  <div key={level} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Level {level} - {urgencyLabels[level]}</p>
                      <p className="text-sm text-gray-600">{count} decisions</p>
                    </div>
                    <Badge className={urgencyColors[level]}>{count}</Badge>
                  </div>
                );
              })}
            </div>

            {(!analyticsData?.analytics?.urgency_breakdown || Object.keys(analyticsData.analytics.urgency_breakdown).length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No urgency data available for this period</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Recent Decisions</h2>
          <div className="space-y-2">
            {analyticsData?.recent_activity && analyticsData.recent_activity.length > 0 ? (
              analyticsData.recent_activity.map((decision: any) => (
                <div key={decision.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => router.push(`/decisions/${decision.id}`)}>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{decision.title}</p>
                    <p className="text-sm text-gray-600">{decision.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      decision.urgency_level >= 4 ? 'bg-red-100 text-red-700' :
                      decision.urgency_level === 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }>
                      Level {decision.urgency_level}
                    </Badge>
                    <span className="text-sm text-gray-500">{new Date(decision.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent decisions available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Key Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-green-600 text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-green-900 mb-2">Faster Decisions</h3>
            <p className="text-sm text-green-800">
              Response times decreased by 60% after implementing AI-powered classification and structured workflows.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-purple-600 text-3xl mb-3">😊</div>
            <h3 className="font-semibold text-purple-900 mb-2">Higher Satisfaction</h3>
            <p className="text-sm text-purple-800">
              Customer satisfaction improved by 0.3 points through more consistent and faster customer responses.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-blue-600 text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-blue-900 mb-2">Better Outcomes</h3>
            <p className="text-sm text-blue-800">
              Anonymous team evaluation leads to more balanced decisions and improved customer outcome tracking.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
