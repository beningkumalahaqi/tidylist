'use client'

export function FeatureCard({ feature, onClick, isActive, isDisabled }) {
  const Icon = feature.icon

  return (
    <button
      onClick={() => onClick(feature)}
      disabled={isDisabled}
      className={`w-full p-4 rounded-lg border-2 border-transparent hover:border-blue-200 transition-all duration-200 text-left ${
        isActive 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white hover:bg-gray-50'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${feature.color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">
            {feature.name}
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            {feature.description}
          </p>
        </div>
      </div>
    </button>
  )
}
