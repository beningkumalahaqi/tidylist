'use client'

import { Bot, User } from 'lucide-react'
import { marked } from 'marked'

export function ChatMessage({ message, features }) {
  const isBot = message.type === 'bot'
  const isUser = message.type === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : message.isError
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isBot && (
          <div className="flex items-center mb-2">
            <Bot className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              TidyBot
              {message.featureType && (
                <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
                  {features.find(f => f.id === message.featureType)?.name}
                </span>
              )}
            </span>
          </div>
        )}
        
        {isUser && (
          <div className="flex items-center mb-2">
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Anda</span>
          </div>
        )}

        <div 
          className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}
          dangerouslySetInnerHTML={{ 
            __html: marked(message.content) 
          }}
        />
        
        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString('id-ID')}
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">TidyBot</span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-gray-600">Sedang mengetik...</span>
        </div>
      </div>
    </div>
  )
}
