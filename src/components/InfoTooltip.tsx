import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  content: string
  className?: string
}

export function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={`text-gray-400 hover:text-gray-600 transition-colors ${className}`}
        type="button"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 w-80 leading-relaxed">
          <div className="whitespace-normal">
            {content}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}
