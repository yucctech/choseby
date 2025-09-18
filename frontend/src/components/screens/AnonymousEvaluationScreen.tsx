'use client';

import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MobileLayout } from '../layout/MobileLayout';

interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: string;
}

interface Option {
  id: string;
  name: string;
  description: string;
}

interface EvaluationScore {
  criterion_id: string;
  score: number;
  rationale?: string;
  confidence: number;
}

interface OptionEvaluation {
  option_id: string;
  criterion_scores: EvaluationScore[];
}

interface AnonymousEvaluationScreenProps {
  options: Option[];
  criteria: Criterion[];
  onSubmit: (evaluations: OptionEvaluation[], overallConfidence: number, notes?: string) => void;
  onBack: () => void;
}

export function AnonymousEvaluationScreen({
  options,
  criteria,
  onSubmit,
  onBack
}: AnonymousEvaluationScreenProps) {
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<{ [key: string]: OptionEvaluation }>({});
  const [overallConfidence, setOverallConfidence] = useState(5);
  const [notes, setNotes] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);

  const currentOption = options[currentOptionIndex];

  const updateScore = (criterionId: string, field: 'score' | 'confidence', value: number) => {
    const optionKey = currentOption.id;
    const currentEval = evaluations[optionKey] || {
      option_id: currentOption.id,
      criterion_scores: criteria.map(c => ({
        criterion_id: c.id,
        score: 5,
        confidence: 5
      }))
    };

    const updatedScores = currentEval.criterion_scores.map(cs =>
      cs.criterion_id === criterionId
        ? { ...cs, [field]: value }
        : cs
    );

    setEvaluations({
      ...evaluations,
      [optionKey]: {
        ...currentEval,
        criterion_scores: updatedScores
      }
    });
  };

  const updateRationale = (criterionId: string, rationale: string) => {
    const optionKey = currentOption.id;
    const currentEval = evaluations[optionKey] || {
      option_id: currentOption.id,
      criterion_scores: criteria.map(c => ({
        criterion_id: c.id,
        score: 5,
        confidence: 5
      }))
    };

    const updatedScores = currentEval.criterion_scores.map(cs =>
      cs.criterion_id === criterionId
        ? { ...cs, rationale }
        : cs
    );

    setEvaluations({
      ...evaluations,
      [optionKey]: {
        ...currentEval,
        criterion_scores: updatedScores
      }
    });
  };

  const getCurrentOptionEvaluation = () => {
    return evaluations[currentOption.id] || {
      option_id: currentOption.id,
      criterion_scores: criteria.map(c => ({
        criterion_id: c.id,
        score: 5,
        confidence: 5
      }))
    };
  };

  const isCurrentOptionComplete = () => {
    const optionEval = getCurrentOptionEvaluation();
    return optionEval.criterion_scores.every(cs => {
      // Require rationale for extreme scores (1-2 or 9-10)
      if ((cs.score <= 2 || cs.score >= 9) && !cs.rationale?.trim()) {
        return false;
      }
      return true;
    });
  };

  const areAllOptionsComplete = () => {
    return options.every(option => {
      const optionEval = evaluations[option.id];
      if (!optionEval) return false;
      return optionEval.criterion_scores.every(cs => {
        if ((cs.score <= 2 || cs.score >= 9) && !cs.rationale?.trim()) {
          return false;
        }
        return true;
      });
    });
  };

  const handleNext = () => {
    if (currentOptionIndex < options.length - 1) {
      setCurrentOptionIndex(currentOptionIndex + 1);
    } else {
      setShowSubmit(true);
    }
  };

  const handlePrevious = () => {
    if (showSubmit) {
      setShowSubmit(false);
    } else if (currentOptionIndex > 0) {
      setCurrentOptionIndex(currentOptionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const evaluationList = Object.values(evaluations);
    onSubmit(evaluationList, overallConfidence, notes);
  };

  const renderStarRating = (value: number, onChange: (value: number) => void, label: string) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1"
            >
              {star <= value ? (
                <StarIcon className="w-6 h-6 text-yellow-500" />
              ) : (
                <StarOutlineIcon className="w-6 h-6 text-gray-300" />
              )}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 text-center">
          {value}/10 {value <= 3 ? '(Poor)' : value <= 6 ? '(Fair)' : value <= 8 ? '(Good)' : '(Excellent)'}
        </div>
      </div>
    );
  };

  if (showSubmit) {
    return (
      <MobileLayout
        title="Submit Evaluation"
        onBack={handlePrevious}
        showProgress={true}
        currentPhase={4}
        totalPhases={6}
        showAnonymous={true}
      >
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              📊 Final Review
            </h2>
            <p className="text-gray-600">
              Review your evaluation and submit anonymous feedback
            </p>
          </div>

          {/* Overall Confidence */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {renderStarRating(
              overallConfidence,
              setOverallConfidence,
              'Overall Decision Confidence'
            )}
            <p className="text-sm text-gray-600 mt-2">
              How confident are you in the team's ability to make a good decision with this information?
            </p>
          </div>

          {/* Optional Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share any additional thoughts, concerns, or suggestions..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {notes.length}/500 characters
            </div>
          </div>

          {/* Evaluation Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Evaluation Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Options Evaluated:</span>
                <span className="font-medium">{options.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Criteria Assessed:</span>
                <span className="font-medium">{criteria.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overall Confidence:</span>
                <span className="font-medium">{overallConfidence}/10</span>
              </div>
            </div>
          </div>

          {/* Anonymous Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Anonymous Submission</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your individual scores will be aggregated with team responses.
                  Only participation status (not scores) will be linked to your identity.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!areAllOptionsComplete()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Anonymous Evaluation
          </button>
        </div>
      </MobileLayout>
    );
  }

  const currentEval = getCurrentOptionEvaluation();

  return (
    <MobileLayout
      title={`Evaluate Option ${currentOptionIndex + 1}/${options.length}`}
      onBack={currentOptionIndex === 0 ? onBack : handlePrevious}
      showProgress={true}
      currentPhase={4}
      totalPhases={6}
      showAnonymous={true}
    >
      <div className="p-4 space-y-6">
        {/* Option Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {currentOption.name}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentOption.description}
          </p>
        </div>

        {/* Criteria Evaluation */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">
            Rate this option against each criterion:
          </h3>

          {criteria.map((criterion, index) => {
            const score = currentEval.criterion_scores.find(cs => cs.criterion_id === criterion.id);
            const currentScore = score?.score || 5;
            const currentConfidence = score?.confidence || 5;
            const currentRationale = score?.rationale || '';

            const needsRationale = currentScore <= 2 || currentScore >= 9;

            return (
              <div key={criterion.id} className="bg-white rounded-lg border border-gray-200 p-4">
                {/* Criterion Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Weight: {criterion.weight}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>

                {/* Score Rating */}
                {renderStarRating(
                  currentScore,
                  (value) => updateScore(criterion.id, 'score', value),
                  'Score'
                )}

                {/* Confidence Rating */}
                <div className="mt-4">
                  {renderStarRating(
                    currentConfidence,
                    (value) => updateScore(criterion.id, 'confidence', value),
                    'Confidence in Score'
                  )}
                </div>

                {/* Rationale for Extreme Scores */}
                {needsRationale && (
                  <div className="mt-4">
                    <div className="flex items-start space-x-2 mb-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rationale Required
                        </label>
                        <p className="text-xs text-gray-600">
                          Please explain your {currentScore <= 2 ? 'low' : 'high'} score
                        </p>
                      </div>
                    </div>
                    <textarea
                      value={currentRationale}
                      onChange={(e) => updateRationale(criterion.id, e.target.value)}
                      placeholder="Explain your reasoning for this score..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex space-x-3">
          {currentOptionIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50"
            >
              Previous Option
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isCurrentOptionComplete()}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentOptionIndex === options.length - 1 ? 'Review & Submit' : 'Next Option'}
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2">
          {options.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentOptionIndex
                  ? 'bg-blue-600'
                  : index < currentOptionIndex
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}