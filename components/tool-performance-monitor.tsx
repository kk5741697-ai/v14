"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  Zap, 
  HardDrive, 
  Cpu, 
  TrendingUp,
  AlertTriangle
} from "lucide-react"

interface PerformanceMetrics {
  processingTime: number
  memoryUsage: number
  cpuUsage: number
  fileSize: {
    input: number
    output: number
    compression: number
  }
  quality: {
    score: number
    issues: string[]
  }
}

interface ToolPerformanceMonitorProps {
  toolName: string
  isProcessing: boolean
  metrics?: PerformanceMetrics
  className?: string
}

export function ToolPerformanceMonitor({
  toolName,
  isProcessing,
  metrics,
  className = ""
}: ToolPerformanceMonitorProps) {
  const [realTimeMetrics, setRealTimeMetrics] = useState<Partial<PerformanceMetrics>>({})

  useEffect(() => {
    if (!isProcessing) return

    const interval = setInterval(() => {
      // Simulate real-time metrics
      setRealTimeMetrics({
        processingTime: Date.now() % 10000,
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 80,
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isProcessing])

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const currentMetrics = isProcessing ? realTimeMetrics : metrics

  if (!isProcessing && !metrics) return null

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>Performance Monitor</span>
          {isProcessing && (
            <Badge className="bg-blue-100 text-blue-800 animate-pulse">
              Processing
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Processing Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Processing Time</span>
          </div>
          <span className="text-sm font-medium">
            {currentMetrics?.processingTime ? formatTime(currentMetrics.processingTime) : "0ms"}
          </span>
        </div>

        {/* Memory Usage */}
        {currentMetrics?.memoryUsage !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <span className="text-sm font-medium">
                {Math.round(currentMetrics.memoryUsage)}%
              </span>
            </div>
            <Progress value={currentMetrics.memoryUsage} className="h-1" />
          </div>
        )}

        {/* CPU Usage */}
        {currentMetrics?.cpuUsage !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-gray-500" />
                <span className="text-sm">CPU Usage</span>
              </div>
              <span className="text-sm font-medium">
                {Math.round(currentMetrics.cpuUsage)}%
              </span>
            </div>
            <Progress value={currentMetrics.cpuUsage} className="h-1" />
          </div>
        )}

        {/* File Size Comparison */}
        {metrics?.fileSize && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm">File Size</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Input:</span>
                <span className="ml-1 font-medium">
                  {formatFileSize(metrics.fileSize.input)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Output:</span>
                <span className="ml-1 font-medium">
                  {formatFileSize(metrics.fileSize.output)}
                </span>
              </div>
            </div>
            {metrics.fileSize.compression !== 0 && (
              <div className="text-xs">
                <span className="text-gray-500">Compression:</span>
                <span className={`ml-1 font-medium ${
                  metrics.fileSize.compression > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {metrics.fileSize.compression > 0 ? "+" : ""}{metrics.fileSize.compression.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quality Score */}
        {metrics?.quality && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Quality Score</span>
              <span className="text-sm font-medium">{metrics.quality.score}/100</span>
            </div>
            <Progress value={metrics.quality.score} className="h-1" />
            {metrics.quality.issues.length > 0 && (
              <div className="space-y-1">
                {metrics.quality.issues.map((issue, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}