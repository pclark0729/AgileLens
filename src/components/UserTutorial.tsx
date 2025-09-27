import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Calendar, Upload, Brain, BarChart3, Users, CheckCircle } from 'lucide-react'

interface UserTutorialProps {
  onComplete: () => void
  userName: string
}

export function UserTutorial({ onComplete, userName }: UserTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: `Welcome to AgileLens, ${userName}!`,
      description: "Let's take a quick tour to get you started with AI-powered sprint planning.",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            AgileLens helps you plan smarter sprints using AI and historical data. 
            You'll be able to forecast capacity, track velocity, and get actionable insights.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What you'll learn:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• How to create and manage sprints</li>
              <li>• How to import historical data</li>
              <li>• How to use AI forecasting</li>
              <li>• How to track team performance</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Create Your First Sprint",
      description: "Start by creating a sprint to track your team's work.",
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Sprints are the foundation of AgileLens. Each sprint tracks your team's committed 
            and completed story points, helping you understand your velocity.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">To create a sprint:</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Go to the Sprints page</li>
              <li>2. Click "Create Sprint"</li>
              <li>3. Fill in sprint details (name, dates, team size)</li>
              <li>4. Add story points committed and completed</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "Import Historical Data",
      description: "Upload past sprint data to get better AI insights.",
      icon: <Upload className="h-8 w-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            The more historical data you have, the better your AI forecasts will be. 
            You can import data from CSV files or manually enter past sprints.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">CSV Format:</h4>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded">
              sprint_name,start_date,end_date,story_points_committed,story_points_completed,team_size,blockers
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Forecasting",
      description: "Get intelligent predictions for your sprint capacity.",
      icon: <Brain className="h-8 w-8 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Once you have at least 3 sprints of data, you can generate AI forecasts 
            that predict optimal sprint capacity and identify potential risks.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">AI Features:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Sprint capacity predictions</li>
              <li>• Risk identification</li>
              <li>• Performance recommendations</li>
              <li>• Velocity trend analysis</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Track Performance",
      description: "Monitor your team's velocity and sprint health.",
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Use the dashboard to visualize your team's performance with velocity charts, 
            burndown charts, and key metrics.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-green-900 text-sm">Velocity Chart</h4>
              <p className="text-xs text-green-700">Track story points completed over time</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 text-sm">Burndown Chart</h4>
              <p className="text-xs text-blue-700">Monitor sprint progress</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: "Ready to start planning smarter sprints.",
      icon: <Users className="h-8 w-8 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            You now know the basics of AgileLens! Start by creating your first sprint 
            or importing historical data to get the most out of the AI features.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Next Steps:</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• Create your first sprint</li>
              <li>• Import historical data if available</li>
              <li>• Explore the AI forecasting features</li>
              <li>• Set up team management</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTutorial = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {steps[currentStep].icon}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-gray-500">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
          <button
            onClick={skipTutorial}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {steps[currentStep].content}
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4 inline mr-1" />
                  Previous
                </button>
              )}
              
              <button
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 inline ml-1" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
