'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Search,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  UserCheck,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { getStudentByStudentId } from '@/lib/database'

interface Student {
  id: string
  student_id: string
  name: string
  email: string
  phone: string
  dob: string
  gender: string
  address: string
  registration_status: 'pending' | 'paid' | 'verified' | 'rejected'
  residency_status: 'day' | 'boarding' | 'lodging'
  created_at: string
  programs?: {
    name: string
    code: string
    level: string
    department: string
  }
  academic_history?: {
    lastSchoolAttended: string
    yearCompleted: string
    qualificationLevel: string
    grades: string
  }
  emergency_contact?: {
    name: string
    relationship: string
    phone: string
  }
}

export default function StudentPortalPage() {
  const [loginMethod, setLoginMethod] = useState<'student_id' | 'email'>('student_id')
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      if (loginMethod === 'student_id' && !studentId.trim()) {
        toast.error('Please enter your Student ID')
        return
      }

      if (loginMethod === 'email' && !email.trim()) {
        toast.error('Please enter your email address')
        return
      }

      // For now, we'll implement simple student ID lookup
      // In production, you'd implement proper authentication
      if (loginMethod === 'student_id') {
        const studentData = await getStudentByStudentId(studentId.trim())
        setStudent(studentData)
        toast.success('Login successful!')
      } else {
        // Email-based lookup would go here
        toast.error('Email login not implemented yet. Please use Student ID.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Student not found. Please check your Student ID and try again.')
      toast.error('Student not found')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setStudent(null)
    setStudentId('')
    setEmail('')
    setPassword('')
    setError(null)
    toast.success('Logged out successfully')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default'
      case 'paid': return 'default'
      case 'pending': return 'secondary'
      case 'rejected': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle
      case 'paid': return CheckCircle
      case 'pending': return Clock
      case 'rejected': return AlertCircle
      default: return FileText
    }
  }

  if (student) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-gray-600">Welcome back, {student.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogIn className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Status Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {(() => {
                      const Icon = getStatusIcon(student.registration_status)
                      return <Icon className="h-8 w-8 text-blue-600" />
                    })()}
                  </div>
                  <Badge variant={getStatusColor(student.registration_status)} className="mb-2">
                    {student.registration_status?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  <p className="text-sm text-gray-600">Application Status</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <GraduationCap className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="font-medium">{student.programs?.name || 'No Program'}</p>
                  <p className="text-sm text-gray-600">Selected Program</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Application Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-medium">{student.student_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{student.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{student.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accommodation:</span>
                      <span className="font-medium capitalize">{student.residency_status}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Program Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {student.programs ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Program:</span>
                          <span className="font-medium">{student.programs.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Code:</span>
                          <span className="font-medium">{student.programs.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Level:</span>
                          <Badge variant="outline">{student.programs?.level?.toUpperCase() || 'UNKNOWN'}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{student.programs.department}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600">No program information available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Personal Info Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Date of Birth</Label>
                      <p className="font-medium">{new Date(student.dob).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Gender</Label>
                      <p className="font-medium capitalize">{student.gender}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Address</Label>
                    <p className="font-medium">{student.address}</p>
                  </div>
                  {student.emergency_contact && (
                    <div>
                      <Label className="text-gray-600">Emergency Contact</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{student.emergency_contact.name}</p>
                        <p className="text-sm text-gray-600">{student.emergency_contact.relationship}</p>
                        <p className="text-sm text-gray-600">{student.emergency_contact.phone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Tab */}
            <TabsContent value="academic">
              <Card>
                <CardHeader>
                  <CardTitle>Academic History</CardTitle>
                </CardHeader>
                <CardContent>
                  {student.academic_history ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-600">Last School Attended</Label>
                          <p className="font-medium">{student.academic_history.lastSchoolAttended}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Year Completed</Label>
                          <p className="font-medium">{student.academic_history.yearCompleted}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-600">Qualification Level</Label>
                          <p className="font-medium capitalize">{student.academic_history.qualificationLevel.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Grades/Results</Label>
                          <p className="font-medium">{student.academic_history.grades || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">No academic history available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>View your payment status and history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payment System Coming Soon</h3>
                    <p className="text-gray-600">Payment tracking and fee management will be available in the next update.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Portal</h1>
          <p className="text-gray-600">Access your application status and student information</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Student Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'student_id' | 'email')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student_id">Student ID</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              <TabsContent value="student_id" className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="e.g., NPI20240001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have a Student ID?
                <Button variant="link" className="p-0 h-auto ml-1">
                  Apply Now
                </Button>
              </p>
              <p className="text-sm text-gray-600">
                Forgot your credentials?
                <Button variant="link" className="p-0 h-auto ml-1">
                  Contact Admissions
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
