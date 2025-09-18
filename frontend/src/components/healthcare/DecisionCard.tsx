import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getConflictColor, formatDate } from '@/lib/utils'
import {
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface DecisionCardProps {
  decision: {
    id: string
    title: string
    description: string
    status: 'draft' | 'active' | 'completed'
    created_at: string
    team_id: string
    conflicts?: Array<{
      level: 'low' | 'medium' | 'high'
      option_name: string
      criterion_name: string
    }>
    participants_count?: number
    evaluations_count?: number
  }
  onViewDetails: (id: string) => void
  onStartEvaluation?: (id: string) => void
}

export function DecisionCard({ decision, onViewDetails, onStartEvaluation }: DecisionCardProps) {
  const hasHighConflicts = decision.conflicts?.some(c => c.level === 'high')
  const hasMediumConflicts = decision.conflicts?.some(c => c.level === 'medium')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'active': return 'text-blue-600 bg-blue-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />
      case 'active': return <ClockIcon className="h-4 w-4" />
      case 'draft': return <ClockIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium text-gray-900 line-clamp-2">
              {decision.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {decision.description}
            </CardDescription>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(decision.status)}`}>
            {getStatusIcon(decision.status)}
            {decision.status}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Conflict Indicators */}
        {decision.conflicts && decision.conflicts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-gray-700">Team Conflicts Detected</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {decision.conflicts.slice(0, 3).map((conflict, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getConflictColor(conflict.level)}`}
                >
                  {conflict.level} conflict
                </span>
              ))}
              {decision.conflicts.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-600 bg-gray-50">
                  +{decision.conflicts.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <UserGroupIcon className="h-3 w-3" />
              <span>{decision.participants_count || 0} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              <span>{decision.evaluations_count || 0} evaluations</span>
            </div>
          </div>
          <time dateTime={decision.created_at}>
            {formatDate(decision.created_at)}
          </time>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(decision.id)}
          className="flex-1"
        >
          View Details
        </Button>
        {decision.status === 'active' && onStartEvaluation && (
          <Button
            variant={hasHighConflicts ? 'destructive' : hasMediumConflicts ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onStartEvaluation(decision.id)}
            className="flex-1"
          >
            {hasHighConflicts ? 'Resolve Conflicts' : 'Evaluate'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}