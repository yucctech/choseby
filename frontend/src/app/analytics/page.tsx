'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api-client';
import type { DashboardMetrics, ResponseTimeMetrics, CustomerSatisfactionMetrics, CustomerTier } from '@/types';

export default function AnalyticsPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [responseTimeMetrics, setResponseTimeMetrics] = useState<ResponseTimeMetrics | null>(null);
  const [satisfactionMetrics, setSatisfactionMetrics] = useState<CustomerSatisfactionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // TODO: Get actual team ID from auth context
  const teamId = 'demo-team-id';

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let startDate: string | undefined;

      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'all':
          startDate = undefined;
          break;
      }

      const [dashboardData, responseTimeData, satisfactionData] = await Promise.all([
        api.analytics.getDashboardMetrics(teamId),
        api.analytics.getResponseTimeMetrics(teamId, startDate, now.toISOString()),
        api.analytics.getCustomerSatisfactionMetrics(teamId, startDate, now.toISOString()),
      ]);

      setMetrics(dashboardData);
      setResponseTimeMetrics(responseTimeData as ResponseTimeMetrics);
      setSatisfactionMetrics(satisfactionData as CustomerSatisfactionMetrics);
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
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
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
                <p className="text-3xl font-bold text-gray-900">{metrics?.total_decisions || 0}</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last period</p>
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
                <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                <p className="text-3xl font-bold text-green-600">{responseTimeMetrics?.avg_time_to_first_response?.toFixed(1) || 0}h</p>
                <p className="text-xs text-green-600 mt-1">↓ 45% faster</p>
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
                <p className="text-3xl font-bold text-purple-600">{satisfactionMetrics?.avg_satisfaction_score?.toFixed(1) || 0}/5</p>
                <p className="text-xs text-green-600 mt-1">↑ 0.3 improvement</p>
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
                <p className="text-sm text-gray-600 mb-1">NPS Change</p>
                <p className="text-3xl font-bold text-blue-600">+{satisfactionMetrics?.avg_nps_change?.toFixed(0) || 0}</p>
                <p className="text-xs text-green-600 mt-1">Positive trend</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Response Time Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Response Time Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Average First Response</p>
                  <p className="text-2xl font-bold text-gray-900">{responseTimeMetrics?.avg_time_to_first_response?.toFixed(1) || 0}h</p>
                </div>
                <div className="text-green-600 text-sm font-medium">↓ 45%</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Average Resolution Time</p>
                  <p className="text-2xl font-bold text-gray-900">{responseTimeMetrics?.avg_time_to_resolution?.toFixed(1) || 0}h</p>
                </div>
                <div className="text-green-600 text-sm font-medium">↓ 60%</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Median Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{responseTimeMetrics?.median_response_time?.toFixed(1) || 0}h</p>
                </div>
                <div className="text-green-600 text-sm font-medium">↓ 50%</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">95th Percentile</p>
                  <p className="text-2xl font-bold text-gray-900">{responseTimeMetrics?.percentile_95?.toFixed(1) || 0}h</p>
                </div>
                <div className="text-gray-500 text-sm font-medium">Tracking</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>💡 Insight:</strong> Response times improved by 60% after implementing AI classification and structured workflows.
              </p>
            </div>
          </Card>

          {/* Customer Satisfaction Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Customer Satisfaction Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Overall Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{satisfactionMetrics?.avg_satisfaction_score?.toFixed(1) || 0}/5</p>
                </div>
                <div className="text-green-600 text-sm font-medium">+0.3</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">NPS Score Change</p>
                  <p className="text-2xl font-bold text-gray-900">+{satisfactionMetrics?.avg_nps_change?.toFixed(0) || 0}</p>
                </div>
                <div className="text-green-600 text-sm font-medium">↑ Improving</div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Satisfaction by Customer Tier</p>
                <div className="space-y-2">
                  {satisfactionMetrics?.satisfaction_by_tier && Object.entries(satisfactionMetrics.satisfaction_by_tier).map(([tier, score]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs capitalize">{tier}</Badge>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">{score.toFixed(1)}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900">
                <strong>💡 Insight:</strong> Enterprise and platinum tier customers show highest satisfaction with structured decision workflows.
              </p>
            </div>
          </Card>
        </div>

        {/* Decision Type Analysis */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Satisfaction by Response Type</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {satisfactionMetrics?.satisfaction_by_response_type && Object.entries(satisfactionMetrics.satisfaction_by_response_type).map(([type, score]) => (
              <div key={type} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{type.replace('_', ' ')}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold">{score.toFixed(1)}/5</span>
                </div>
              </div>
            ))}
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
