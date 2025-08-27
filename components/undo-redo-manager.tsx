"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Undo, Redo, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface HistoryState {
  id: string
  timestamp: number
  description: string
  data: any
}

interface UndoRedoManagerProps {
  onStateChange: (state: any) => void
  maxHistorySize?: number
  className?: string
}

export function UndoRedoManager({
  onStateChange,
  maxHistorySize = 50,
  className = ""
}: UndoRedoManagerProps) {
  const [history, setHistory] = useState<HistoryState[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const saveState = useCallback((data: any, description: string) => {
    const newState: HistoryState = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      description,
      data: JSON.parse(JSON.stringify(data)) // Deep clone
    }

    setHistory(prev => {
      // Remove any states after current index (when user made changes after undo)
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(newState)
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift()
        return newHistory
      }
      
      return newHistory
    })

    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1))
  }, [currentIndex, maxHistorySize])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      onStateChange(history[newIndex].data)
      
      toast({
        title: "Undone",
        description: `Reverted: ${history[currentIndex].description}`,
      })
    }
  }, [currentIndex, history, onStateChange])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      onStateChange(history[newIndex].data)
      
      toast({
        title: "Redone",
        description: `Applied: ${history[newIndex].description}`,
      })
    }
  }, [currentIndex, history, onStateChange])

  const reset = useCallback(() => {
    if (history.length > 0) {
      setCurrentIndex(0)
      onStateChange(history[0].data)
      
      toast({
        title: "Reset",
        description: "Reverted to initial state",
      })
    }
  }, [history, onStateChange])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1
  const canReset = history.length > 0 && currentIndex > 0

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        title={canUndo ? `Undo: ${history[currentIndex]?.description}` : "Nothing to undo"}
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        title={canRedo ? `Redo: ${history[currentIndex + 1]?.description}` : "Nothing to redo"}
      >
        <Redo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={reset}
        disabled={!canReset}
        title="Reset to initial state"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      
      {history.length > 0 && (
        <span className="text-xs text-gray-500 ml-2">
          {currentIndex + 1}/{history.length}
        </span>
      )}
    </div>
  )

  // Expose saveState function for parent components
  return {
    component: (
      <div className={`flex items-center space-x-1 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title={canUndo ? `Undo: ${history[currentIndex]?.description}` : "Nothing to undo"}
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title={canRedo ? `Redo: ${history[currentIndex + 1]?.description}` : "Nothing to redo"}
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!canReset}
          title="Reset to initial state"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        {history.length > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            {currentIndex + 1}/{history.length}
          </span>
        )}
      </div>
    ),
    saveState
  }
}