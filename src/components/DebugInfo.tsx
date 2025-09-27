import { useAuth } from '../lib/auth-context'

export function DebugInfo() {
  const { user, loading } = useAuth()
  
  const forceStopLoading = () => {
    // This is a debug function - in production, this would be handled properly
    console.log('Force stopping loading state')
    window.location.reload()
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? 'logged in' : 'not logged in'}</div>
      <div>User ID: {user?.id || 'none'}</div>
      <div>User Name: {user?.name || 'none'}</div>
      <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'undefined'}</div>
      <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'not set'}</div>
      {loading && (
        <button 
          onClick={forceStopLoading}
          className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs"
        >
          Force Stop Loading
        </button>
      )}
    </div>
  )
}
