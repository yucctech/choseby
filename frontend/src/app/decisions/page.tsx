'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api-client';
import type { CustomerDecision, PaginatedResponse } from '@/types';

export default function DecisionsListPage() {
  return (
    <ProtectedRoute>
      <DecisionsListContent />
    </ProtectedRoute>
  );
}

function DecisionsListContent() {
  const router = useRouter();
  const [decisions, setDecisions] = useState<CustomerDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  // TODO: Get actual team ID from auth context
  const teamId = 'demo-team-id';

  useEffect(() => {
    loadDecisions();
  }, [statusFilter, pagination.page]);

  const loadDecisions = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.decisions.list(undefined, params);
      setDecisions(response.decisions || []);
      setPagination(prev => ({ ...prev, total: response.total || 0 }));
    } catch (error) {
      console.error('Failed to load decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDecisions = decisions.filter(decision => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      decision.title.toLowerCase().includes(query) ||
      decision.description.toLowerCase().includes(query) ||
      decision.customer_name.toLowerCase().includes(query) ||
      decision.decision_type.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-tier-bronze text-white',
      silver: 'bg-tier-silver text-gray-900',
      gold: 'bg-tier-gold text-gray-900',
      platinum: 'bg-tier-platinum text-gray-900',
      enterprise: 'bg-tier-enterprise text-white',
    };
    return colors[tier] || 'bg-gray-500 text-white';
  };

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return 'bg-urgency-critical text-white';
    if (level >= 3) return 'bg-urgency-high text-white';
    if (level >= 2) return 'bg-urgency-medium text-white';
    return 'bg-urgency-low text-white';
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  if (loading && decisions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading decisions...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">All Decisions</h1>
              <p className="text-gray-600 mt-1">View and manage all customer response decisions</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ← Dashboard
              </Button>
              <Link href="/decisions/new">
                <Button>+ New Decision</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by title, customer, or decision type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {/* Sort */}
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="urgency">Highest Urgency</option>
              <option value="customer_tier">Customer Tier</option>
            </select>
          </div>
        </Card>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {decisions.filter(d => d.status === 'in_progress').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {decisions.filter(d => d.status === 'completed').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Draft</p>
            <p className="text-2xl font-bold text-gray-600">
              {decisions.filter(d => d.status === 'draft').length}
            </p>
          </Card>
        </div>

        {/* Decisions List */}
        {filteredDecisions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No decisions found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first customer response decision'}
            </p>
            {!searchQuery && (
              <Link href="/decisions/new">
                <Button>Create First Decision</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDecisions.map((decision) => (
              <Link key={decision.id} href={`/decisions/${decision.id}`}>
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{decision.title}</h3>
                        <Badge className={getStatusColor(decision.status)}>
                          {decision.status.replace('_', ' ')}
                        </Badge>
                        {decision.urgency_level >= 4 && (
                          <Badge className="bg-red-600 text-white">URGENT</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{decision.description}</p>

                      {/* Metadata Tags */}
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium">{decision.customer_name}</span>
                        </div>

                        <Badge className={`text-xs ${getTierColor(decision.customer_tier)}`}>
                          {decision.customer_tier}
                        </Badge>

                        <Badge className={`text-xs ${getUrgencyColor(decision.urgency_level)}`}>
                          Urgency {decision.urgency_level}
                        </Badge>

                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-gray-600">Type:</span>
                          <span className="text-xs font-medium">{decision.decision_type || 'Not specified'}</span>
                        </div>

                        {decision.financial_impact && decision.financial_impact > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-gray-600">Impact:</span>
                            <span className="text-xs font-medium">${decision.financial_impact.toLocaleString()}</span>
                          </div>
                        )}

                        {decision.workflow_type && (
                          <Badge className="text-xs bg-purple-100 text-purple-800">
                            {decision.workflow_type.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Right Side Info */}
                    <div className="flex flex-col items-end gap-2 text-sm">
                      <div className="text-gray-600">
                        Phase {decision.current_phase}/6
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(decision.current_phase / 6) * 100}%` }}
                        />
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(decision.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} decisions
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  ← Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`px-3 py-1 rounded ${
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
