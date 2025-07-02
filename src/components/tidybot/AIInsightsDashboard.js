'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Target, AlertCircle, CheckCircle } from 'lucide-react'

export function AIInsightsDashboard({ userId }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [userId])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/tidybot/insights')
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!insights) {
    return null
  }

  const insightCards = [
    {
      title: 'Produktivitas Minggu Ini',
      value: `${insights.weeklyCompletionRate}%`,
      change: insights.weeklyChange,
      icon: TrendingUp,
      color: insights.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: insights.weeklyChange >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      title: 'Rata-rata Waktu Tugas',
      value: `${insights.avgTaskTime} min`,
      change: insights.timeChange,
      icon: Clock,
      color: insights.timeChange <= 0 ? 'text-green-600' : 'text-orange-600',
      bgColor: insights.timeChange <= 0 ? 'bg-green-100' : 'bg-orange-100'
    },
    {
      title: 'Tugas Prioritas Tinggi',
      value: insights.highPriorityTasks,
      change: null,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Tugas Terlambat',
      value: insights.overdueTasks,
      change: null,
      icon: AlertCircle,
      color: insights.overdueTasks > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: insights.overdueTasks > 0 ? 'bg-red-100' : 'bg-green-100'
    }
  ]

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Insight AI</h3>
      <div className="grid grid-cols-2 gap-3">
        {insightCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                {card.change !== null && (
                  <span className={`text-xs font-medium ${card.color}`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </span>
                )}
              </div>
              <div className="mt-2">
                <p className="text-lg font-semibold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-600">{card.title}</p>
              </div>
            </div>
          )
        })}
      </div>
      
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Rekomendasi AI</p>
              <p className="text-xs text-blue-700 mt-1">
                {insights.recommendations[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
