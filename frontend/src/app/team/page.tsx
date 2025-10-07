'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api-client';
import type { Team, TeamMember, User } from '@/types';

export default function TeamManagementPage() {
  return (
    <ProtectedRoute>
      <TeamManagementContent />
    </ProtectedRoute>
  );
}

function TeamManagementContent() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Form states
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    organization: '',
  });

  const [newMemberData, setNewMemberData] = useState({
    email: '',
    role: 'member' as 'owner' | 'admin' | 'member',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await api.teams.list();
      setTeams(teamsData);
      if (teamsData.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsData[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const membersData = await api.teams.getMembers(teamId);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTeamData.name || !newTeamData.organization) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const newTeam = await api.teams.create(newTeamData.name, newTeamData.organization);
      setTeams([...teams, newTeam]);
      setSelectedTeam(newTeam);
      setNewTeamData({ name: '', organization: '' });
      setShowCreateTeam(false);
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeam || !newMemberData.email) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // In production, this would look up user by email
      // For now, using placeholder user ID
      const userId = 'user-' + newMemberData.email.split('@')[0];

      await api.teams.addMember(selectedTeam.id, userId, newMemberData.role);
      await loadTeamMembers(selectedTeam.id);
      setNewMemberData({ email: '', role: 'member' });
      setShowAddMember(false);
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add team member. Please try again.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teams...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">Manage your customer response teams and members</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              ← Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Teams</h2>
                <Button
                  size="sm"
                  onClick={() => setShowCreateTeam(!showCreateTeam)}
                >
                  + New
                </Button>
              </div>

              {/* Create Team Form */}
              {showCreateTeam && (
                <form onSubmit={handleCreateTeam} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">Create New Team</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Team Name"
                      value={newTeamData.name}
                      onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Organization"
                      value={newTeamData.organization}
                      onChange={(e) => setNewTeamData({ ...newTeamData, organization: e.target.value })}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Create</Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateTeam(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Teams List */}
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No teams yet</p>
                  <Button onClick={() => setShowCreateTeam(true)}>
                    Create First Team
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedTeam?.id === team.id
                          ? 'bg-primary-50 border-2 border-primary-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.organization}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="space-y-6">
                {/* Team Info */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{selectedTeam.name}</h2>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Organization</p>
                      <p className="font-medium">{selectedTeam.organization}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-medium">{new Date(selectedTeam.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Team Members</p>
                      <p className="font-medium">{members.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Team ID</p>
                      <p className="font-mono text-xs text-gray-500">{selectedTeam.id}</p>
                    </div>
                  </div>
                </Card>

                {/* Team Members */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Team Members</h2>
                    <Button
                      size="sm"
                      onClick={() => setShowAddMember(!showAddMember)}
                    >
                      + Add Member
                    </Button>
                  </div>

                  {/* Add Member Form */}
                  {showAddMember && (
                    <form onSubmit={handleAddMember} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3">Invite Team Member</h3>
                      <div className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={newMemberData.email}
                          onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                          required
                        />
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          value={newMemberData.role}
                          onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value as any })}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">Send Invite</Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddMember(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Members List */}
                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">👥</div>
                      <p className="text-gray-500 mb-4">No team members yet</p>
                      <Button onClick={() => setShowAddMember(true)}>
                        Invite First Member
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-semibold">
                                {member.user_id.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">User {member.user_id}</p>
                              <p className="text-sm text-gray-600">
                                Joined {new Date(member.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {member.role}
                            </Badge>
                            {member.role !== 'owner' && (
                              <button className="text-gray-400 hover:text-red-600 text-sm">
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Team Settings */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Team Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Decision Workflow
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option value="full_decide">Full Decide (Complete workflow)</option>
                        <option value="quick_input">Quick Input (Fast track)</option>
                        <option value="ai_only">AI Only (Automated)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anonymous Evaluation Mode
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="anonymous" defaultChecked className="rounded" />
                        <label htmlFor="anonymous" className="text-sm text-gray-600">
                          Always collect team evaluations anonymously
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Classification
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="ai-classify" defaultChecked className="rounded" />
                        <label htmlFor="ai-classify" className="text-sm text-gray-600">
                          Automatically classify new decisions with AI
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button variant="outline" className="text-red-600 hover:bg-red-50">
                        Delete Team
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Team Selected</h3>
                <p className="text-gray-600 mb-4">Select a team from the list or create a new one</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
