'use client'

import { MessageCircle } from 'lucide-react'

export function QuickQuestions({ questions, onQuestionClick }) {
  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-900 mb-3">Pertanyaan Cepat</h3>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="w-full text-left p-3 text-sm bg-white rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors dark:text-black"
          >
            <MessageCircle className="h-4 w-4 text-blue-500 inline mr-2" />
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
