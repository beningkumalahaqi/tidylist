'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Bot, Send, Loader2, TrendingUp, Calendar, BarChart3, Lightbulb } from 'lucide-react'
import { ChatMessage, TypingIndicator } from '@/components/tidybot/ChatMessage'
import { FeatureCard } from '@/components/tidybot/FeatureCard'
import { QuickQuestions } from '@/components/tidybot/QuickQuestions'
import { AdvancedFeatures } from '@/components/tidybot/AdvancedFeatures'
import { AIInsightsDashboard } from '@/components/tidybot/AIInsightsDashboard'
import { ContextSuggestions } from '@/components/tidybot/ContextSuggestions'
import Navigation from '@/components/Navigation'

export default function TidyBotPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Halo! Saya TidyBot, asisten AI untuk membantu Anda mengelola tugas dengan lebih efektif. Apa yang bisa saya bantu hari ini?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const features = [
    {
      id: 'weekly-insight',
      name: 'Insight Mingguan',
      description: 'Dapatkan analisis performa tugas minggu ini',
      icon: TrendingUp,
      color: 'bg-blue-500',
      prompt: 'Berikan insight mingguan saya'
    },
    {
      id: 'schedule-suggestion',
      name: 'Saran Jadwal',
      description: 'Optimalkan penjadwalan tugas Anda',
      icon: Calendar,
      color: 'bg-green-500',
      prompt: 'Bantu saya menjadwalkan tugas'
    },
    {
      id: 'balance-analysis',
      name: 'Analisis Keseimbangan',
      description: 'Cek keseimbangan waktu antar kategori',
      icon: BarChart3,
      color: 'bg-purple-500',
      prompt: 'Analisis keseimbangan waktu saya'
    },
    {
      id: 'productivity-tips',
      name: 'Tips Produktivitas',
      description: 'Dapatkan tips meningkatkan produktivitas',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      prompt: 'Berikan tips produktivitas untuk saya'
    }
  ]

  const quickQuestions = [
    'Apa tugas terpenting saya hari ini?',
    'Bagaimana cara mengatasi procrastination?',
    'Kapan waktu terbaik untuk mengerjakan tugas berat?',
    'Bagaimana membagi waktu yang efektif?',
    'Tips menyelesaikan tugas tepat waktu?'
  ]

  const sendMessage = async (message, type = 'chat') => {
    // Handle undefined message for non-chat types
    const userMessage = message || inputMessage || ''
    
    if (!userMessage.trim() && type === 'chat') return

    setIsLoading(true)

    // Add user message to chat
    if (type === 'chat') {
      setMessages(prev => [...prev, {
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      }])
      setInputMessage('')
    }

    try {
      const response = await fetch('/api/tidybot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          type
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          featureType: type !== 'chat' ? type : null
        }])
      } else {
        throw new Error(data.error || 'Something went wrong')
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
        timestamp: new Date(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
      setActiveFeature(null)
    }
  }

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature.id)
    sendMessage(feature.prompt, feature.id)
  }

  const handleQuickQuestion = (question) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Silakan login untuk menggunakan TidyBot
          </h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">TidyBot</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Asisten AI pribadi Anda untuk produktivitas dan manajemen tugas yang lebih efektif
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Features Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <AIInsightsDashboard userId={session?.user?.id} />
              
              <h3 className="font-semibold text-gray-900 mb-3">Fitur AI</h3>
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  onClick={handleFeatureClick}
                  isActive={activeFeature === feature.id}
                  isDisabled={isLoading}
                />
              ))}

              <AdvancedFeatures 
                onFeatureClick={handleFeatureClick}
                isLoading={isLoading}
              />

              <ContextSuggestions 
                onSuggestionClick={handleQuickQuestion}
              />

              <QuickQuestions 
                questions={quickQuestions}
                onQuestionClick={handleQuickQuestion}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    features={features}
                  />
                ))}
                
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tanyakan sesuatu kepada TidyBot..."
                    disabled={isLoading}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:text-black dark:bg-gray-100 dark:border-gray-300 transition-colors"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
