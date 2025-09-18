'use client';

import React from 'react';
import { ChevronRightIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { MobileLayout } from '../layout/MobileLayout';

interface Team {
  id: string;
  name: string;
  organization: string;
  industry: string;
  user_role: string;
  member_count?: number;
  active_decisions?: number;
}

interface TeamSelectionScreenProps {
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export function TeamSelectionScreen({
  teams,
  onSelectTeam,
  onBack,
  loading = false
}: TeamSelectionScreenProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-purple-100 text-purple-800';
      case 'facilitator':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'observer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <MobileLayout title="Select Team" onBack={onBack}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Select Team" onBack={onBack}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <UsersIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Choose Your Team
          </h2>
          <p className="text-gray-600 mt-1">
            Select a healthcare team to continue
          </p>
        </div>

        {/* Teams List */}
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Teams Found
            </h3>
            <p className="text-gray-600 mb-4">
              You're not currently a member of any healthcare teams.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
              Request Team Access
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Team Name */}
                    <h3 className="font-medium text-gray-900 truncate">
                      {team.name}
                    </h3>

                    {/* Organization */}
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {team.organization}
                    </p>

                    {/* Role and Stats */}
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(team.user_role)}`}>
                        {formatRole(team.user_role)}
                      </span>

                      {team.member_count && (
                        <span className="text-xs text-gray-500">
                          {team.member_count} members
                        </span>
                      )}

                      {team.active_decisions !== undefined && (
                        <span className="text-xs text-gray-500">
                          {team.active_decisions} active decisions
                        </span>
                      )}
                    </div>

                    {/* Industry Badge */}
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                        {team.industry === 'healthcare' ? '🏥 Healthcare' : team.industry}
                      </span>
                    </div>
                  </div>

                  <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create Team Option */}
        {teams.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 hover:bg-gray-100 transition-colors">
              <UsersIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">
                Create New Team
              </span>
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}