'use client';

import { useState, useEffect } from 'react';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { TeamSelectionScreen } from '@/components/screens/TeamSelectionScreen';
import { DecisionTypeScreen } from '@/components/screens/DecisionTypeScreen';
import { AnonymousEvaluationScreen } from '@/components/screens/AnonymousEvaluationScreen';
import { ConflictResolutionScreen } from '@/components/screens/ConflictResolutionScreen';

type Screen = 'login' | 'team-selection' | 'decision-type' | 'evaluation' | 'conflict-resolution';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  teams: string[];
}

interface Team {
  id: string;
  name: string;
  organization: string;
  industry: string;
  user_role: string;
  member_count: number;
  active_decisions: number;
}

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock data for demonstration
  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'Emergency Department Leadership',
      organization: 'Metropolitan General Hospital',
      industry: 'healthcare',
      user_role: 'facilitator',
      member_count: 8,
      active_decisions: 3
    },
    {
      id: '2',
      name: 'ICU Quality Committee',
      organization: 'Metropolitan General Hospital',
      industry: 'healthcare',
      user_role: 'member',
      member_count: 6,
      active_decisions: 1
    },
    {
      id: '3',
      name: 'Nursing Administration',
      organization: 'Metropolitan General Hospital',
      industry: 'healthcare',
      user_role: 'administrator',
      member_count: 12,
      active_decisions: 5
    }
  ];

  const mockOptions = [
    {
      id: '1',
      name: 'Increase Staffing',
      description: 'Hire additional clinical staff to reduce workload and improve patient care'
    },
    {
      id: '2',
      name: 'Implement New Protocol',
      description: 'Create standardized procedures to improve efficiency without additional staff'
    },
    {
      id: '3',
      name: 'Outsource Non-Clinical Functions',
      description: 'Contract external services for administrative tasks to free up clinical time'
    }
  ];

  const mockCriteria = [
    {
      id: '1',
      name: 'Patient Safety',
      description: 'Impact on patient outcomes and safety measures',
      weight: 35,
      category: 'clinical'
    },
    {
      id: '2',
      name: 'Staff Satisfaction',
      description: 'Effect on healthcare worker wellbeing and job satisfaction',
      weight: 25,
      category: 'operational'
    },
    {
      id: '3',
      name: 'Financial Impact',
      description: 'Cost considerations and budget implications',
      weight: 20,
      category: 'financial'
    },
    {
      id: '4',
      name: 'Implementation Time',
      description: 'How quickly the solution can be implemented',
      weight: 20,
      category: 'operational'
    }
  ];

  const mockConflicts = [
    {
      id: '1',
      option_name: 'Outsource Non-Clinical Functions',
      criterion_name: 'Quality Control',
      variance_score: 3.2,
      conflict_level: 'high' as const,
      evaluation_count: 5,
      score_range: { mean: 5.2, min: 2, max: 9 }
    },
    {
      id: '2',
      option_name: 'Outsource Non-Clinical Functions',
      criterion_name: 'Cost Impact',
      variance_score: 2.8,
      conflict_level: 'medium' as const,
      evaluation_count: 5,
      score_range: { mean: 6.1, min: 3, max: 8 }
    }
  ];

  const handleLogin = async (email: string, password: string, ssoProvider?: string) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful login
      if (email === 'demo@example.com' || ssoProvider) {
        const mockUser = {
          id: '1',
          email: email || 'sso@hospital.com',
          name: ssoProvider ? 'Dr. Sarah Smith (SSO)' : 'Dr. Sarah Smith',
          role: 'physician',
          teams: ['1', '2', '3']
        };

        setUser(mockUser);
        setTeams(mockTeams);
        setCurrentScreen('team-selection');
      } else {
        throw new Error('Invalid credentials. Use demo@example.com for testing.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelection = (teamId: string) => {
    setSelectedTeam(teamId);
    setCurrentScreen('decision-type');
  };

  const handleDecisionCreation = (decisionData: any) => {
    console.log('Decision created:', decisionData);
    setCurrentScreen('evaluation');
  };

  const handleEvaluationSubmit = (evaluations: any, overallConfidence: number, notes?: string) => {
    console.log('Evaluation submitted:', { evaluations, overallConfidence, notes });
    // Simulate conflict detection
    setCurrentScreen('conflict-resolution');
  };

  const handleConflictResolution = (resolutionType: string, facilitatorId?: string) => {
    console.log('Conflict resolution started:', { resolutionType, facilitatorId });
    // Continue to next phase
  };

  const handleBack = () => {
    switch (currentScreen) {
      case 'team-selection':
        setCurrentScreen('login');
        setUser(null);
        break;
      case 'decision-type':
        setCurrentScreen('team-selection');
        break;
      case 'evaluation':
        setCurrentScreen('decision-type');
        break;
      case 'conflict-resolution':
        setCurrentScreen('evaluation');
        break;
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            loading={loading}
            error={error}
          />
        );

      case 'team-selection':
        return (
          <TeamSelectionScreen
            teams={teams}
            onSelectTeam={handleTeamSelection}
            onBack={handleBack}
            loading={loading}
          />
        );

      case 'decision-type':
        return (
          <DecisionTypeScreen
            onContinue={handleDecisionCreation}
            onBack={handleBack}
          />
        );

      case 'evaluation':
        return (
          <AnonymousEvaluationScreen
            options={mockOptions}
            criteria={mockCriteria}
            onSubmit={handleEvaluationSubmit}
            onBack={handleBack}
          />
        );

      case 'conflict-resolution':
        return (
          <ConflictResolutionScreen
            conflicts={mockConflicts}
            consensusLevel={65}
            anonymousConcerns={[
              'Risk to patient care quality',
              'Budget concerns overstated',
              'Implementation too complex'
            ]}
            onStartResolution={handleConflictResolution}
            onContinueWithConflicts={() => console.log('Continue with conflicts')}
            onBack={handleBack}
          />
        );

      default:
        return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderCurrentScreen()}
    </div>
  );
}
