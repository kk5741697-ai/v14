"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, Zap } from "lucide-react"

interface ProcessingStep {
  id: string
  name: string
  status: "pending" | "processing" | "completed" | "error"
  progress?: number
  error?: string
}

interface ProcessingStatusProps {
  steps: ProcessingStep[]
  currentStep?: string
  onComplete?: () => void
  onError?: (error: string) => void
}

export function ProcessingStatus({
  steps,
  currentStep,
  onComplete,
  onError
}: ProcessingStatusProps) {
  const [localSteps, setLocalSteps] = useState(steps)

  useEffect(() => {
    setLocalSteps(steps)
  }, [steps])

  const getStepIcon = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "processing":
        return <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepBadge = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Done</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const overallProgress = (localSteps.filter(s => s.status === "completed").length / localSteps.length) * 100

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Step Details */}
      <div className="space-y-3">
        {localSteps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
              step.status === "processing" 
                ? "bg-blue-50 border-blue-200" 
                : step.status === "completed"
                  ? "bg-green-50 border-green-200"
                  : step.status === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex-shrink-0">
              {getStepIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {step.name}
                </p>
                {getStepBadge(step.status)}
              </div>
              
              {step.status === "processing" && step.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={step.progress} className="h-1" />
                </div>
              )}
              
              {step.error && (
                <p className="text-xs text-red-600 mt-1">{step.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t">
        {localSteps.filter(s => s.status === "completed").length} of {localSteps.length} steps completed
      </div>
    </div>
  )
}