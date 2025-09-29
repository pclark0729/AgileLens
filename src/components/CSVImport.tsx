import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, Download, X, CheckCircle, AlertCircle } from 'lucide-react'
import { validateCSVData, formatValidationErrors } from '../utils/validation'
import { useAuth } from '../lib/auth-context'

interface CSVImportProps {
  onComplete: () => void
  onCancel: () => void
}

export function CSVImport({ onComplete, onCancel }: CSVImportProps) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [preview, setPreview] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    console.log('File selected:', selectedFile)
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setSuccess(false)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
        })
        return row
      })

      // Validate the data
      const validation = validateCSVData(data)
      if (!validation.isValid) {
        setError(formatValidationErrors(validation.errors))
        setPreview([])
        return
      }

      setError('')
      setPreview(data.slice(0, 5)) // Show first 5 rows as preview
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csvContent = [
      'Sprint Name,Start Date,End Date,Story Points Committed,Story Points Completed,Team Size,Blockers,Notes',
      'Sprint 1,2024-01-01,2024-01-15,20,18,5,2,Great sprint with good velocity',
      'Sprint 2,2024-01-16,2024-01-30,25,22,5,1,Some scope creep but managed well',
      'Sprint 3,2024-02-01,2024-02-15,22,20,5,0,Clean sprint with no blockers'
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sprint-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const ensureDefaultTeam = async () => {
    // Ensure the default team exists
    const { error } = await supabase
      .from('teams')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Default Team',
        created_at: new Date().toISOString()
      }, { onConflict: 'id' })
    
    if (error) {
      console.error('Error ensuring default team:', error)
    }
  }

  const handleImport = async () => {
    console.log('Import button clicked, file:', file)
    if (!file) {
      console.log('No file selected')
      return
    }

    if (!user?.team_id) {
      setError('You must be assigned to a team before importing data. Please contact your administrator.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        
        const sprints = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const row: any = {}
          headers.forEach((header, index) => {
            row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
          })
          return row
        }).map(row => ({
          team_id: user?.team_id, // Only use user's team_id, don't fallback to default team
          sprint_name: row.sprint_name || '',
          start_date: row.start_date || '',
          end_date: row.end_date || '',
          story_points_committed: parseInt(row.story_points_committed) || 0,
          story_points_completed: parseInt(row.story_points_completed) || 0,
          team_size: parseInt(row.team_size) || 1,
          blockers: parseInt(row.blockers) || 0,
          notes: row.notes || '',
        }))

        console.log('Inserting sprints:', sprints)
        
        const { error } = await supabase
          .from('sprints')
          .insert(sprints)

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Import successful')
        setSuccess(true)
        setTimeout(() => {
          onComplete()
        }, 1500)
      }
      reader.readAsText(file)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Import Sprint Data</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
        </div>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Download className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Need a template?</h4>
                <p className="text-sm text-blue-700">Download our CSV template to get started.</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="ml-auto btn-primary text-sm"
              >
                Download Template
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
                {file && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      ✓ File selected: {file.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-sm text-green-800">Sprint data imported successfully!</p>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-3 rounded text-xs">
              <p>Debug: File selected: {file ? 'Yes' : 'No'}</p>
              <p>Debug: Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Debug: Button disabled: {(!file || loading) ? 'Yes' : 'No'}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className={`btn-primary ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Import Data'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
