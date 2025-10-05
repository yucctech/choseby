'use client';

import { useState, useEffect } from 'react';
import { DefineProblem } from './DefineProblem';
import { EstablishCriteria } from './EstablishCriteria';
import { ConsiderOptions } from './ConsiderOptions';
import { AnonymousEvaluation } from './AnonymousEvaluation';
import { ActionPlanning } from './ActionPlanning';
import { MonitorResults } from './MonitorResults';
import { apiClient } from '@/lib/api-client';
import type { Decision, DecisionOption, DecisionCriteria } from '@/types';

interface DecisionWorkflowProps {
  decisionId: string;
  teamId?: string;
  onBack: () => void;
  onComplete: () => void;
}

export function DecisionWorkflow({ decisionId, teamId, onBack, onComplete }: DecisionWorkflowProps) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [options, setOptions] = useState<DecisionOption[]>([]);
  const [criteria, setCriteria] = useState<DecisionCriteria[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecisionData();
  }, [decisionId]);

  const loadDecisionData = async () => {
    try {
      setLoading(true);

      const decisionData = await apiClient.getDecision(teamId || decision?.team_id || '', decisionId);
      setDecision(decisionData);

      if (decisionData.current_phase >= 2) {
        const criteriaData = await apiClient.getCriteria(decisionData.team_id, decisionId);
        setCriteria(criteriaData);
      }

      if (decisionData.current_phase >= 3) {
        const optionsData = await apiClient.getOptions(decisionData.team_id, decisionId);
        setOptions(optionsData);
      }
    } catch (error) {
      console.error('Failed to load decision data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseComplete = async (nextPhase: number) => {
    if (!decision) return;

    await apiClient.updateDecision(decision.team_id, decisionId, { current_phase: nextPhase });
    await loadDecisionData();
  };

  if (loading || !decision) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading decision...</p>
        </div>
      </div>
    );
  }

  if (decision.current_phase === 1) {
    return (
      <DefineProblem
        decision={decision}
        onBack={onBack}
        onContinue={() => handlePhaseComplete(2)}
      />
    );
  }

  if (decision.current_phase === 2) {
    return (
      <EstablishCriteria
        decision={decision}
        onBack={() => handlePhaseComplete(1)}
        onContinue={() => handlePhaseComplete(3)}
      />
    );
  }

  if (decision.current_phase === 3) {
    return (
      <ConsiderOptions
        decision={decision}
        onBack={() => handlePhaseComplete(2)}
        onContinue={() => handlePhaseComplete(4)}
      />
    );
  }

  if (decision.current_phase === 4) {
    return (
      <AnonymousEvaluation
        decision={decision}
        options={options}
        criteria={criteria}
        onBack={() => handlePhaseComplete(3)}
        onContinue={() => {
          setSelectedOption(options[0]?.name || 'Option 1');
          handlePhaseComplete(5);
        }}
      />
    );
  }

  if (decision.current_phase === 5) {
    return (
      <ActionPlanning
        decision={decision}
        selectedOption={selectedOption || options[0]?.name || 'Selected Option'}
        onBack={() => handlePhaseComplete(4)}
        onContinue={() => handlePhaseComplete(6)}
      />
    );
  }

  if (decision.current_phase === 6) {
    return (
      <MonitorResults
        decision={decision}
        onBack={() => handlePhaseComplete(5)}
        onComplete={onComplete}
      />
    );
  }

  return null;
}