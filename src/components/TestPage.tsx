export function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Test Page
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This page loads without authentication to test if the app is working.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Environment Variables</h3>
          <div className="space-y-2 text-sm">
            <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'undefined'}</div>
            <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'not set'}</div>
            <div>OpenRouter Key: {import.meta.env.VITE_OPENROUTER_API_KEY ? 'set' : 'not set'}</div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
          <div className="text-sm text-green-600">
            ✅ App is loading correctly
          </div>
          <div className="text-sm text-gray-600 mt-2">
            If you can see this page, the React app is working. The loading issue is likely in the authentication flow.
          </div>
        </div>
      </div>
    </div>
  )
}
