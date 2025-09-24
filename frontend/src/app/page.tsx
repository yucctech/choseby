'use client';

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/screens/Dashboard';
import { DecisionCreation } from '@/components/screens/DecisionCreation';
import { DecisionWorkflow } from '@/components/screens/DecisionWorkflow';
import { apiClient } from '@/lib/api-client';
import type { User, Team } from '@/types';

type Screen = 'login' | 'dashboard' | 'create-decision' | 'decision-detail';

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // TODO: Re-enable auto-login when backend /user/profile and /teams endpoints are ready
    // const token = apiClient.getToken();
    // if (token) {
    //   loadUserData();
    // }
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await apiClient.getCurrentUser();
      const teamsData = await apiClient.getTeams();
      setUser(userData);
      setTeams(teamsData);
      if (teamsData.length > 0) {
        setSelectedTeam(teamsData[0]);
        setCurrentScreen('dashboard');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.login(email, password);
      const userData = response.user;

      setUser(userData);

      const teamsData = await apiClient.getTeams();
      setTeams(teamsData);

      if (teamsData.length > 0) {
        setSelectedTeam(teamsData[0]);
        setCurrentScreen('dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setUser(null);
    setTeams([]);
    setSelectedTeam(null);
    setCurrentScreen('login');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
  }

  if (!user || !selectedTeam) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  if (currentScreen === 'dashboard') {
    return (
      <Dashboard
        user={user}
        team={selectedTeam}
        onCreateDecision={() => setCurrentScreen('create-decision')}
        onViewDecision={(id) => {
          setSelectedDecisionId(id);
          setCurrentScreen('decision-detail');
        }}
      />
    );
  }

  if (currentScreen === 'create-decision') {
    return (
      <DecisionCreation
        team={selectedTeam}
        onBack={() => setCurrentScreen('dashboard')}
        onContinue={(decisionId) => {
          setSelectedDecisionId(decisionId);
          setCurrentScreen('decision-detail');
        }}
      />
    );
  }

  if (currentScreen === 'decision-detail' && selectedDecisionId) {
    return (
      <DecisionWorkflow
        decisionId={selectedDecisionId}
        teamId={selectedTeam?.id}
        onBack={() => setCurrentScreen('dashboard')}
        onComplete={() => setCurrentScreen('dashboard')}
      />
    );
  }

  return null;
}

function LoginScreen({ onLogin, loading, error }: { onLogin: (email: string, password: string) => void; loading: boolean; error: string }) {
  const [email, setEmail] = useState('demo@choseby.com');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 ChoseBy Healthcare</h1>
          <p className="text-gray-600">Team Decision Platform</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-3">Healthcare SSO Options</p>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Sign in with Epic
              </button>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Sign in with Cerner
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Demo credentials: demo@choseby.com / demo123
        </p>
      </div>
    </div>
  );
}