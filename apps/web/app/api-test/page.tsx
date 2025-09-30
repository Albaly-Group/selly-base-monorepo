'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '../../lib/api-client'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export default function ApiTestPage() {
  const [healthStatus, setHealthStatus] = useState<string>('')
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const testHealthCheck = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.healthCheck()
      setHealthStatus(response)
    } catch (err) {
      setError(`Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetCompanies = async () => {
    setLoading(true)
    setError('')
    try {
      // Use searchCompanies instead of getCompanies for better parameter handling
      const response = await apiClient.searchCompanies({
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
        includeSharedData: true,
        page: 1,
        limit: 10
      })
      setCompanies(response.data || [])
      setError(`✅ Companies retrieved! Found ${response.data?.length || 0} companies`)
    } catch (err) {
      setError(`❌ Get companies failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setError('')
    try {
      // Test with demo credentials
      const response = await apiClient.login('admin@albaly.com', 'password')
      setError(`✅ Login successful! Token: ${response.accessToken.substring(0, 20)}...
User: ${response.user.name} (${response.user.email})
Organization: ${response.user.organization?.name || 'None'}`)
    } catch (err) {
      setError(`❌ Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testCurrentUser = async () => {
    setLoading(true)
    setError('')
    try {
      const user = await apiClient.getCurrentUser()
      setError(`✅ Current user retrieved! 
Name: ${user.name}
Email: ${user.email}
Organization ID: ${user.organizationId || 'None'}`)
    } catch (err) {
      setError(`❌ Get current user failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Connection Test</h1>
          <p className="text-gray-600">Test communication with NestJS backend</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-700 font-medium">Error:</div>
              <div className="text-red-600 mt-1">{error}</div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Check Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Health Check
                <Badge variant="outline">GET /health</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testHealthCheck} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Health Check'}
              </Button>
              
              {healthStatus && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-sm font-medium text-green-800">Response:</div>
                  <div className="text-green-700 mt-1">{healthStatus}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Login Test
                <Badge variant="outline">POST /api/v1/auth/login</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testLogin} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Login (Demo User)'}
              </Button>
            </CardContent>
          </Card>

          {/* Current User Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Get Current User
                <Badge variant="outline">GET /api/v1/auth/me</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testCurrentUser} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Get Current User'}
              </Button>
            </CardContent>
          </Card>

          {/* Companies Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Companies
                <Badge variant="outline">GET /api/v1/companies</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testGetCompanies} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Get Companies'}
              </Button>
              
              {companies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-800">Response:</div>
                  {companies.map((company, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm">
                        <div><strong>Name:</strong> {company.displayName}</div>
                        <div><strong>ID:</strong> {company.id}</div>
                        <div><strong>Reg ID:</strong> {company.registrationId}</div>
                        <div><strong>Data Source:</strong> {company.dataSource}</div>
                        <div><strong>Shared Data:</strong> {company.isSharedData ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Architecture Info */}
        <Card>
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Frontend (Next.js)</h3>
                  <p className="text-blue-700 text-sm mt-1">Running on port 3000</p>
                  <p className="text-blue-600 text-sm">Located in apps/web/</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Backend (NestJS)</h3>
                  <p className="text-green-700 text-sm mt-1">Running on port 3001</p>
                  <p className="text-green-600 text-sm">Located in apps/api/</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Shared Types</h3>
                <p className="text-purple-600 text-sm">Located in packages/types/</p>
                <p className="text-purple-600 text-sm">Provides type safety across frontend and backend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}