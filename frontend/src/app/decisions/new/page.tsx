'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api-client';
import type { CustomerTier, UrgencyLevel, WorkflowType, AIClassification } from '@/types';

export default function NewDecisionPage() {
  return (
    <ProtectedRoute>
      <NewDecisionContent />
    </ProtectedRoute>
  );
}

function NewDecisionContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<AIClassification | null>(null);

  // TODO: Get actual team ID from auth context
  const teamId = 'demo-team-id';

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_name: '',
    customer_email: '',
    customer_tier: 'silver' as CustomerTier,
    customer_value: 0,
    urgency_level: 3 as UrgencyLevel,
    customer_impact_scope: 'single_user',
    relationship_duration_months: 0,
    previous_issues_count: 0,
    nps_score: 0,
    decision_type: '',
    financial_impact: 0,
    workflow_type: 'full_decide' as WorkflowType,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIClassification = async () => {
    if (!formData.description) {
      alert('Please enter a description first');
      return;
    }

    try {
      setClassifying(true);

      // Build customer context for AI
      const customerContext = `
Customer: ${formData.customer_name}
Tier: ${formData.customer_tier}
Value: $${formData.customer_value}
Relationship: ${formData.relationship_duration_months} months
Previous Issues: ${formData.previous_issues_count}
NPS Score: ${formData.nps_score}
      `.trim();

      // Create temporary decision for classification
      const tempDecision = await api.decisions.create(teamId, {
        title: formData.title || 'Temporary Decision',
        description: formData.description,
        customer_name: formData.customer_name,
        customer_tier: formData.customer_tier,
        urgency_level: formData.urgency_level,
        previous_issues_count: formData.previous_issues_count,
        status: 'draft',
        workflow_type: formData.workflow_type,
        current_phase: 1,
      });

      // Get AI classification
      const classification = await api.ai.classify(
        tempDecision.id,
        formData.description,
        customerContext
      );

      setAiClassification(classification);

      // Auto-fill fields from AI classification
      handleInputChange('decision_type', classification.decision_type);
      handleInputChange('urgency_level', classification.urgency_level as UrgencyLevel);

      // Clean up temp decision
      await api.decisions.delete(tempDecision.id);

    } catch (error) {
      console.error('AI classification failed:', error);
      alert('AI classification failed. Please try again or fill manually.');
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.customer_name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const decision = await api.decisions.create('', {
        ...formData,
        ai_classification: aiClassification || undefined,
        status: 'draft',
        current_phase: 1,
      });

      router.push(`/decisions/${decision.id}`);
    } catch (error) {
      console.error('Failed to create decision:', error);
      alert('Failed to create decision. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: CustomerTier) => {
    const colors: Record<CustomerTier, string> = {
      bronze: 'bg-tier-bronze',
      silver: 'bg-tier-silver',
      gold: 'bg-tier-gold',
      platinum: 'bg-tier-platinum',
      enterprise: 'bg-tier-enterprise',
    };
    return colors[tier];
  };

  const getUrgencyColor = (level: UrgencyLevel) => {
    if (level >= 4) return 'bg-urgency-critical';
    if (level >= 3) return 'bg-urgency-high';
    if (level >= 2) return 'bg-urgency-medium';
    return 'bg-urgency-low';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">New Customer Response Decision</h1>
          <p className="text-gray-600 mt-1">Create a structured decision workflow for customer response</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Decision Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Refund request for enterprise customer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the customer issue and context..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAIClassification}
                  disabled={classifying || !formData.description}
                >
                  {classifying ? '🤖 Classifying...' : '🤖 AI Classify'}
                </Button>

                {aiClassification && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-green-100 text-green-800">
                      AI Confidence: {(aiClassification.confidence_score * 100).toFixed(0)}%
                    </Badge>
                    <span className="text-gray-600">
                      Type: {aiClassification.decision_type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Customer Context */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Context</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email
                </label>
                <Input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Tier <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {(['bronze', 'silver', 'gold', 'platinum', 'enterprise'] as CustomerTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleInputChange('customer_tier', tier)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.customer_tier === tier
                          ? `${getTierColor(tier)} text-white shadow-md`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Value (LTV)
                </label>
                <Input
                  type="number"
                  value={formData.customer_value}
                  onChange={(e) => handleInputChange('customer_value', parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('urgency_level', level as UrgencyLevel)}
                      className={`w-12 h-12 rounded-lg font-bold transition-all ${
                        formData.urgency_level === level
                          ? `${getUrgencyColor(level as UrgencyLevel)} text-white shadow-md`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">1 = Low, 3 = Medium, 5 = Critical</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact Scope
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.customer_impact_scope}
                  onChange={(e) => handleInputChange('customer_impact_scope', e.target.value)}
                >
                  <option value="single_user">Single User</option>
                  <option value="team">Team</option>
                  <option value="department">Department</option>
                  <option value="company">Entire Company</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Duration (months)
                </label>
                <Input
                  type="number"
                  value={formData.relationship_duration_months}
                  onChange={(e) => handleInputChange('relationship_duration_months', parseInt(e.target.value) || 0)}
                  placeholder="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Issues Count
                </label>
                <Input
                  type="number"
                  value={formData.previous_issues_count}
                  onChange={(e) => handleInputChange('previous_issues_count', parseInt(e.target.value) || 0)}
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NPS Score
                </label>
                <Input
                  type="number"
                  min="-100"
                  max="100"
                  value={formData.nps_score}
                  onChange={(e) => handleInputChange('nps_score', parseInt(e.target.value) || 0)}
                  placeholder="70"
                />
              </div>
            </div>
          </Card>

          {/* Decision Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Decision Details</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Type
                </label>
                <Input
                  value={formData.decision_type}
                  onChange={(e) => handleInputChange('decision_type', e.target.value)}
                  placeholder="e.g., refund_full, billing_dispute, service_outage"
                />
                {aiClassification && (
                  <p className="text-xs text-gray-500 mt-1">
                    AI suggested: {aiClassification.decision_type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financial Impact ($)
                </label>
                <Input
                  type="number"
                  value={formData.financial_impact}
                  onChange={(e) => handleInputChange('financial_impact', parseFloat(e.target.value) || 0)}
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.workflow_type}
                  onChange={(e) => handleInputChange('workflow_type', e.target.value as WorkflowType)}
                >
                  <option value="full_decide">Full Decide (Complete workflow)</option>
                  <option value="quick_input">Quick Input (Fast track)</option>
                  <option value="ai_only">AI Only (Automated)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* AI Risk Factors */}
          {aiClassification && aiClassification.risk_factors && aiClassification.risk_factors.length > 0 && (
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <h2 className="text-xl font-semibold mb-4 text-yellow-900">⚠️ AI-Detected Risk Factors</h2>
              <ul className="space-y-2">
                {aiClassification.risk_factors.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-yellow-900">{risk}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Decision'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
