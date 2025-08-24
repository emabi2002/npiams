'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Database,
  Settings,
  Users,
  GraduationCap,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Play,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { getDashboardStats, getAllStudents } from '@/lib/database'

interface DashboardStats {
  totalStudents: number
  pendingApplications: number
  verifiedStudents: number
  totalPrograms: number
  pendingPayments: number
}

interface Student {
  id: string
  student_id: string
  name: string
  email: string
  registration_status: 'pending' | 'paid' | 'verified' | 'rejected'
  created_at: string
  programs?: {
    id: string
    name: string
    code: string
    level: string
    department: string
  }
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [setupLoading, setSetupLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [databaseStatus, setDatabaseStatus] = useState<'unknown' | 'ready' | 'missing'>('unknown')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, studentsData] = await Promise.all([
        getDashboardStats(),
        getAllStudents()
      ])

      setStats(statsData)
      setStudents(studentsData || [])

      // Check database status based on whether we have actual data
      if (studentsData && studentsData.length > 0) {
        setDatabaseStatus('ready')
      } else if (statsData && statsData.totalPrograms > 0) {
        setDatabaseStatus('ready')
      } else {
        setDatabaseStatus('missing')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setDatabaseStatus('missing')
    } finally {
      setLoading(false)
    }
  }

  // Get setup instructions and schema
  const setupDatabase = async () => {
    try {
      setSetupLoading(true)
      console.log('Getting setup instructions...')

      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (result.requiresManualSetup) {
        // Show the schema to the user for manual setup
        console.log('Manual setup required - see instructions below');

        // Store the schema for display
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).setupSchema = result.schema
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).setupInstructions = result.instructions

        // Trigger a re-render or modal to show setup instructions
        setSetupLoading(false)
        showSetupModal(result)
      } else if (result.success) {
        console.log('✅ Database setup completed!')
        setDatabaseStatus('ready')
        await fetchData()
      } else {
        console.log(`❌ Database setup failed: ${result.error || 'Unknown error'}`)
        console.error('Setup details:', result)
      }
    } catch (error) {
      console.error('Setup error:', error)
      console.log('❌ Failed to get setup instructions')
    } finally {
      setSetupLoading(false)
    }
  }

  const showSetupModal = (setupInfo: { schema: string; links: { supabaseUrl: string } }) => {
    // For now, just copy schema to clipboard and open Supabase
    copyToClipboard(setupInfo.schema)
    console.log('🗄️ Schema copied to clipboard! Opening Supabase Dashboard...')
    setTimeout(() => {
      window.open(setupInfo.links.supabaseUrl, '_blank')
    }, 1000)
  }

  // Initialize sample data
  const initializeSampleData = async () => {
    try {
      setInitLoading(true)
      console.log('Initializing sample data...')

      const response = await fetch('/api/init-database', { method: 'POST' })
      const result = await response.json()

      if (result.success) {
        console.log('✅ Sample data initialized successfully!')
        await fetchData() // Refresh data
      } else {
        console.log(`❌ Failed to initialize data: ${result.error}`)
      }
    } catch (error) {
      console.error('Init error:', error)
      console.log('❌ Failed to initialize sample data')
    } finally {
      setInitLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    console.log('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Checking Database</h2>
            <p className="text-gray-600">Verifying database connection and tables...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (databaseStatus === 'missing') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup Required</h1>
            <p className="text-gray-600">Set up the database tables to get started</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-500" />
                Academic Management System Integration
              </CardTitle>
              <CardDescription>
                This Student Registration System integrates with your existing Academic Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">✅ Automatic Integration</h3>
                <p className="text-green-800 text-sm mb-2">
                  The system automatically detects and reads from existing academic tables:
                </p>
                <ul className="text-green-800 text-sm list-disc list-inside space-y-1">
                  <li><strong>Programs/Courses:</strong> Reads from courses, academic_programs, or programs tables</li>
                  <li><strong>Departments:</strong> Links to existing department structure if available</li>
                  <li><strong>Academic Periods:</strong> Integrates with semesters/academic_periods</li>
                  <li><strong>Student Data:</strong> Creates new student records without affecting existing academic data</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">🗄️ What Gets Created</h3>
                <p className="text-blue-800 text-sm mb-2">
                  Only registration-specific tables are created:
                </p>
                <ul className="text-blue-800 text-sm list-disc list-inside space-y-1">
                  <li><strong>students:</strong> Student application and registration data</li>
                  <li><strong>payments:</strong> Fee payments and verification</li>
                  <li><strong>student_documents:</strong> Uploaded transcripts and certificates</li>
                  <li><strong>fees:</strong> Registration and program fees</li>
                  <li><strong>accommodation:</strong> Hostel and room assignments</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-900 mb-2">⚠️ Data Protection</h3>
                <p className="text-orange-800 text-sm">
                  Your existing Academic Management System data is completely protected.
                  This system only reads from existing tables and creates new registration-specific tables.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2 text-green-500" />
                Quick Setup (Recommended)
              </CardTitle>
              <CardDescription>
                Automatically set up all database tables with one click
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">🚀 Automatic Setup</h3>
                <p className="text-green-800 text-sm mb-4">
                  Instantly create all required tables using our integration-ready schema.
                  Safe for your existing Academic Management System data.
                </p>
                <Button
                  onClick={setupDatabase}
                  disabled={setupLoading}
                  className="w-full"
                >
                  {setupLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up database...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Auto-Setup Database Tables
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">📋 Manual Setup (Alternative)</h3>
                <p className="text-blue-800 text-sm mb-2">
                  If you prefer to run the SQL manually in Supabase Dashboard:
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Supabase Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/api/schema-file', '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View SQL Schema
                  </Button>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">📚 Initialize Sample Data</h3>
                <p className="text-purple-800 text-sm mb-4">
                  After tables are created, add sample programs and fees (only if academic data doesn't exist):
                </p>
                <Button
                  onClick={initializeSampleData}
                  disabled={initLoading || databaseStatus === 'missing'}
                  variant="outline"
                  className="w-full"
                >
                  {initLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initializing data...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Initialize Sample Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Database Status
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage student applications and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                  <p className="text-gray-600 text-sm">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingApplications || 0}</p>
                  <p className="text-gray-600 text-sm">Pending Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats?.verifiedStudents || 0}</p>
                  <p className="text-gray-600 text-sm">Verified Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalPrograms || 0}</p>
                  <p className="text-gray-600 text-sm">Available Programs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingPayments || 0}</p>
                  <p className="text-gray-600 text-sm">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest student applications submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-sm text-gray-600">Student ID: {student.student_id}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          student.registration_status === 'verified' ? 'default' :
                          student.registration_status === 'pending' ? 'secondary' :
                          student.registration_status === 'rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {student.registration_status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(student.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600">Student applications will appear here once they start applying.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
