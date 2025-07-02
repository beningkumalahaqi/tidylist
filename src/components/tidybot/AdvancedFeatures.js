'use client'

import { useState } from 'react'
import { Brain, Target, Clock, AlertTriangle, Zap } from 'lucide-react'

export function AdvancedFeatures({ onFeatureClick, isLoading }) {
  const [selectedFeature, setSelectedFeature] = useState(null)

  const advancedFeatures = [
    {
      id: 'smart-priority',
      name: 'Prioritas Cerdas',
      description: 'AI akan menganalisis tugas dan memberikan prioritas berdasarkan deadline, kompleksitas, dan dampak',
      icon: Target,
      color: 'bg-red-500',
      prompt: 'Analisis dan berikan prioritas cerdas untuk semua tugas saya'
    },
    {
      id: 'time-prediction',
      name: 'Prediksi Waktu',
      description: 'Estimasi waktu pengerjaan yang akurat berdasarkan riwayat dan kompleksitas tugas',
      icon: Clock,
      color: 'bg-orange-500',
      prompt: 'Prediksi waktu pengerjaan untuk tugas-tugas yang belum selesai'
    },
    {
      id: 'burnout-detection',
      name: 'Deteksi Burnout',
      description: 'Identifikasi tanda-tanda kelelahan dan berikan saran untuk menjaga keseimbangan',
      icon: AlertTriangle,
      color: 'bg-amber-500',
      prompt: 'Analisis apakah saya mengalami tanda-tanda burnout dan berikan saran'
    },
    {
      id: 'energy-optimization',
      name: 'Optimasi Energi',
      description: 'Saran penjadwalan berdasarkan tingkat energi dan performa harian',
      icon: Zap,
      color: 'bg-emerald-500',
      prompt: 'Berikan saran optimasi energi untuk penjadwalan tugas saya'
    },
    {
      id: 'habit-formation',
      name: 'Pembentukan Kebiasaan',
      description: 'Bantu membentuk kebiasaan produktif berdasarkan pola tugas Anda',
      icon: Brain,
      color: 'bg-indigo-500',
      prompt: 'Bantu saya membentuk kebiasaan produktif yang berkelanjutan'
    }
  ]

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature.id)
    onFeatureClick(feature)
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 mb-3">Fitur AI Lanjutan</h3>
      <div className="space-y-3">
        {advancedFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              disabled={isLoading}
              className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedFeature === feature.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-md ${feature.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-xs">
                    {feature.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {feature.description}
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
