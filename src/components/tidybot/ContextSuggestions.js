'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, Clock, Target, AlertTriangle } from 'lucide-react'

export function ContextSuggestions({ onSuggestionClick }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContextSuggestions()
  }, [])

  const loadContextSuggestions = async () => {
    try {
      const response = await fetch('/api/tidybot/suggestions')
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const suggestionIcons = {
    productivity: Lightbulb,
    time: Clock,
    priority: Target,
    warning: AlertTriangle
  }

  if (loading) {
    return (
      <div className="mt-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 mb-3">Saran Contextual</h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestionIcons[suggestion.type] || Lightbulb
          return (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <Icon className={`h-4 w-4 mt-0.5 ${
                  suggestion.type === 'warning' ? 'text-red-500' :
                  suggestion.type === 'priority' ? 'text-orange-500' :
                  suggestion.type === 'time' ? 'text-blue-500' :
                  'text-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
