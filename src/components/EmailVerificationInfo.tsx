import { Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface EmailVerificationInfoProps {
  email: string
  onResendVerification?: () => void
  isResending?: boolean
}

export function EmailVerificationInfo({ email, onResendVerification, isResending = false }: EmailVerificationInfoProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-blue-900">
            Check Your Email
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="mt-2">
              Click the link in the email to verify your account and complete the registration process.
            </p>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center text-sm text-blue-700">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span>Check your inbox (and spam folder)</span>
            </div>
            <div className="flex items-center text-sm text-blue-700">
              <Clock className="h-4 w-4 text-blue-500 mr-2" />
              <span>Verification link expires in 24 hours</span>
            </div>
            <div className="flex items-center text-sm text-blue-700">
              <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span>You can't sign in until email is verified</span>
            </div>
          </div>

          {onResendVerification && (
            <div className="mt-4">
              <p className="text-sm text-blue-700 mb-2">
                Didn't receive the email?
              </p>
              <button
                onClick={onResendVerification}
                disabled={isResending}
                className="text-sm text-blue-600 hover:text-blue-500 underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-100 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> After verifying your email, you'll be able to sign in and start using AgileLens. 
              Your user profile will be automatically created on first login.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
