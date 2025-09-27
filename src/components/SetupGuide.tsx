import { CheckCircle, AlertTriangle, Copy, ExternalLink } from 'lucide-react'

export function SetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to AgileLens!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            To get started, you need to configure your environment variables.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Instructions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">1. Create Environment File</h4>
              <p className="text-sm text-gray-600 mb-3">
                Create a <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env.local</code> file in your project root:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span># Supabase Configuration</span>
                  <button
                    onClick={() => copyToClipboard('VITE_SUPABASE_URL=your_supabase_project_url\nVITE_SUPABASE_ANON_KEY=your_supabase_anon_key\nVITE_OPENROUTER_API_KEY=your_openrouter_api_key')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div>VITE_SUPABASE_URL=your_supabase_project_url</div>
                <div>VITE_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
                <div>VITE_OPENROUTER_API_KEY=your_openrouter_api_key</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">2. Get Supabase Credentials</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Go to your Supabase project dashboard</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Navigate to Settings → API</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Copy your Project URL and anon key</span>
                </div>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mt-2"
              >
                Open Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">3. Set up Database</h4>
              <p className="text-sm text-gray-600 mb-2">
                Run the SQL commands from the <code className="bg-gray-100 px-2 py-1 rounded text-sm">SETUP.md</code> file in your Supabase SQL editor.
              </p>
              <a
                href="https://github.com/yourusername/agilelens/blob/main/SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                View Setup Guide <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">4. Restart Development Server</h4>
              <p className="text-sm text-gray-600">
                After creating the <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env.local</code> file, restart your development server:
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mt-2">
                npm run dev
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Check the README.md and SETUP.md files for detailed instructions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
