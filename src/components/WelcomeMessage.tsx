import { CheckCircle, ArrowRight, Calendar, TrendingUp, Brain } from 'lucide-react'

interface WelcomeMessageProps {
  userName: string
  onDismiss: () => void
}

export function WelcomeMessage({ userName, onDismiss }: WelcomeMessageProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckCircle className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-blue-900">
            Welcome to AgileLens, {userName}! 🎉
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>You're all set up and ready to start planning smarter sprints. Here's what you can do:</p>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center text-sm text-blue-700">
              <Calendar className="h-4 w-4 text-blue-500 mr-3" />
              <span>Create your first sprint to track team performance</span>
            </div>
            <div className="flex items-center text-sm text-blue-700">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-3" />
              <span>Import historical data to get AI-powered insights</span>
            </div>
            <div className="flex items-center text-sm text-blue-700">
              <Brain className="h-4 w-4 text-blue-500 mr-3" />
              <span>Generate forecasts to optimize sprint planning</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-blue-600">
              <ArrowRight className="h-4 w-4 mr-1" />
              <span>Ready to get started?</span>
            </div>
            <button
              onClick={onDismiss}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
