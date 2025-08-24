'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  BookOpen,
  FileText,
  Camera,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { getPrograms, getDepartments, getIntakePeriods, createStudent, generateStudentId } from '@/lib/database'

type ApplicationStep = 'personal' | 'academic' | 'documents' | 'program' | 'biometric' | 'payment' | 'review'

interface Program {
  id: string
  name: string
  code: string
  level: 'certificate' | 'diploma'
  department: string
  department_id: string
  duration_years: number
  duration_months: number
  description: string | null
  is_active: boolean
}

interface IntakePeriod {
  id: string
  name: string
  year: number
  semester: string | null
  start_date: string
  end_date: string
  registration_deadline: string
  status: 'open' | 'closed' | 'upcoming'
}

interface ApplicationData {
  // Personal Information
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationality: string
  address: string
  city: string
  province: string
  postalCode: string
  email: string
  phone: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }

  // Academic History
  lastSchoolAttended: string
  yearCompleted: string
  qualificationLevel: string
  grades: string

  // Program Selection
  departmentId: string
  programId: string
  intakePeriod: string
  residencyStatus: string

  // Documents
  documents: File[]
  transcriptUrl: string
  idCopyUrl: string
  referenceLetter1Url: string
  referenceLetter2Url: string
  otherDocumentsUrl: string

  // Biometric
  photo: string | null
  photoUrl: string
  fingerprintData: string | null

  // Payment
  paymentMethod: string
  receiptUrl: string
}

interface Department {
  id: string
  name: string
  code: string
  description?: string
}

export default function ApplicationPage() {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('personal')
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [intakePeriods, setIntakePeriods] = useState<IntakePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Papua New Guinea',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    email: '',
    phone: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    lastSchoolAttended: '',
    yearCompleted: '',
    qualificationLevel: '',
    grades: '',
    departmentId: '',
    programId: '',
    intakePeriod: '',
    residencyStatus: 'day',
    documents: [],
    transcriptUrl: '',
    idCopyUrl: '',
    referenceLetter1Url: '',
    referenceLetter2Url: '',
    otherDocumentsUrl: '',
    photo: null,
    photoUrl: '',
    fingerprintData: null,
    paymentMethod: '',
    receiptUrl: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Fetching application data from Academic Management System...')
      const [programsData, departmentsData, intakeData] = await Promise.all([
        getPrograms(),
        getDepartments(),
        getIntakePeriods()
      ])

      console.log('✅ Received data:', {
        programs: programsData?.length,
        departments: departmentsData?.length,
        intakes: intakeData?.length
      })

      setPrograms(programsData || [])
      setDepartments(departmentsData || [])
      setIntakePeriods(intakeData || [])
    } catch (err) {
      console.error('❌ Error fetching data:', err)
      setError('Failed to load application data. Please refresh the page.')
      toast.error('Failed to load programs and intake periods')
    } finally {
      setLoading(false)
    }
  }

  const provinces = [
    'Central', 'Chimbu', 'Eastern Highlands', 'East New Britain', 'East Sepik',
    'Enga', 'Gulf', 'Hela', 'Jiwaka', 'Madang', 'Manus', 'Milne Bay',
    'Morobe', 'National Capital District', 'New Ireland', 'Northern',
    'Southern Highlands', 'Western', 'Western Highlands', 'West New Britain', 'West Sepik'
  ]

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: User, completed: false },
    { id: 'academic', title: 'Academic History', icon: GraduationCap, completed: false },
    { id: 'documents', title: 'Documents', icon: FileText, completed: false },
    { id: 'program', title: 'Program Selection', icon: Building, completed: false },
    { id: 'biometric', title: 'Biometric Data', icon: Camera, completed: false },
    { id: 'payment', title: 'Payment', icon: CreditCard, completed: false },
    { id: 'review', title: 'Review & Submit', icon: CheckCircle, completed: false }
  ]

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }

    const stepOrder: ApplicationStep[] = ['personal', 'academic', 'documents', 'program', 'biometric', 'payment', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    const stepOrder: ApplicationStep[] = ['personal', 'academic', 'documents', 'program', 'biometric', 'payment', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  // File upload handlers
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image file size must be less than 5MB')
      return
    }

    try {
      // For now, create a local URL for preview
      const imageUrl = URL.createObjectURL(file)
      updateApplicationData('photoUrl', imageUrl)
      toast.success('Photo uploaded successfully')
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
    }
  }

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image or PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      // For now, just store the file name
      updateApplicationData('receiptUrl', file.name)
      toast.success('Receipt uploaded successfully')
    } catch (error) {
      console.error('Error uploading receipt:', error)
      toast.error('Failed to upload receipt')
    }
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image or PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      // For now, just store the file name
      const fieldName = `${documentType}Url` as keyof ApplicationData
      updateApplicationData(fieldName, file.name)
      toast.success(`${documentType} uploaded successfully`)
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error)
      toast.error(`Failed to upload ${documentType}`)
    }
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'personal':
        const personalRequired = [
          'firstName', 'lastName', 'dateOfBirth', 'gender', 'address',
          'city', 'province', 'email', 'phone'
        ]
        const emergencyRequired = ['name', 'relationship', 'phone']

        for (const field of personalRequired) {
          if (!applicationData[field as keyof ApplicationData]) {
            toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
            return false
          }
        }

        for (const field of emergencyRequired) {
          if (!applicationData.emergencyContact[field as keyof typeof applicationData.emergencyContact]) {
            toast.error(`Please fill in emergency contact ${field}`)
            return false
          }
        }
        break

      case 'academic':
        const academicRequired = ['lastSchoolAttended', 'yearCompleted', 'qualificationLevel']
        for (const field of academicRequired) {
          if (!applicationData[field as keyof ApplicationData]) {
            toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
            return false
          }
        }
        break

      case 'documents':
        if (!applicationData.transcriptUrl) {
          toast.error('Please upload your academic transcript')
          return false
        }
        if (!applicationData.idCopyUrl) {
          toast.error('Please upload a copy of your ID')
          return false
        }
        break

      case 'program':
        if (!applicationData.departmentId) {
          toast.error('Please select a department')
          return false
        }
        if (!applicationData.programId) {
          toast.error('Please select a program')
          return false
        }
        if (!applicationData.intakePeriod) {
          toast.error('Please select an intake period')
          return false
        }
        break

      case 'biometric':
        if (!applicationData.photoUrl) {
          toast.error('Please upload your photo')
          return false
        }
        break

      case 'payment':
        if (!applicationData.paymentMethod) {
          toast.error('Please select a payment method')
          return false
        }
        if (applicationData.paymentMethod === 'bank_deposit' && !applicationData.receiptUrl) {
          toast.error('Please upload your payment receipt')
          return false
        }
        break
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }

    try {
      setSubmitting(true)

      // Generate student ID
      const studentId = await generateStudentId()

      // Find selected program
      const selectedProgram = programs.find(p => p.id === applicationData.programId)

      // Prepare student data for database
      const studentData = {
        student_id: studentId,
        name: `${applicationData.firstName} ${applicationData.lastName}`,
        dob: applicationData.dateOfBirth,
        gender: applicationData.gender as 'male' | 'female' | 'other',
        address: applicationData.address,
        email: applicationData.email,
        phone: applicationData.phone,
        program_id: applicationData.programId,
        intake_period: applicationData.intakePeriod,
        residency_status: applicationData.residencyStatus as 'day' | 'boarding' | 'lodging',
        academic_history: {
          lastSchoolAttended: applicationData.lastSchoolAttended,
          yearCompleted: applicationData.yearCompleted,
          qualificationLevel: applicationData.qualificationLevel,
          grades: applicationData.grades
        },
        emergency_contact: applicationData.emergencyContact,
        registration_status: 'pending' as const
      }

      // Create student record
      const newStudent = await createStudent(studentData)

      toast.success('Application submitted successfully!')
      toast.success(`Your Student ID is: ${studentId}`)

      // Redirect to confirmation page or show success message
      console.log('Application submitted:', newStudent)

    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateApplicationData = (field: string, value: string | number) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedData = (parent: string, field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [parent]: {
        ...((prev as unknown) as Record<string, Record<string, string>>)[parent],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Loading Application Form</h2>
            <p className="text-gray-600">Please wait while we prepare your application...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Form</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Application</h1>
          <p className="text-gray-600">Complete your application for admission to NPI PNG</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = step.completed

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 mt-6 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Personal Information Step */}
            {currentStep === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={applicationData.firstName}
                      onChange={(e) => updateApplicationData('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={applicationData.lastName}
                      onChange={(e) => updateApplicationData('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={applicationData.dateOfBirth}
                      onChange={(e) => updateApplicationData('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={applicationData.gender} onValueChange={(value) => updateApplicationData('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={applicationData.nationality}
                      onChange={(e) => updateApplicationData('nationality', e.target.value)}
                      placeholder="Nationality"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={applicationData.address}
                    onChange={(e) => updateApplicationData('address', e.target.value)}
                    placeholder="Enter your full address"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City/Town *</Label>
                    <Input
                      id="city"
                      value={applicationData.city}
                      onChange={(e) => updateApplicationData('city', e.target.value)}
                      placeholder="City or town"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Select value={applicationData.province} onValueChange={(value) => updateApplicationData('province', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province.toLowerCase().replace(/\s+/g, '-')}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={applicationData.postalCode}
                      onChange={(e) => updateApplicationData('postalCode', e.target.value)}
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={applicationData.email}
                      onChange={(e) => updateApplicationData('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={applicationData.phone}
                      onChange={(e) => updateApplicationData('phone', e.target.value)}
                      placeholder="+675 XXXX XXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Emergency Contact</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyName">Contact Name *</Label>
                      <Input
                        id="emergencyName"
                        value={applicationData.emergencyContact.name}
                        onChange={(e) => updateNestedData('emergencyContact', 'name', e.target.value)}
                        placeholder="Emergency contact name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRelationship">Relationship *</Label>
                      <Input
                        id="emergencyRelationship"
                        value={applicationData.emergencyContact.relationship}
                        onChange={(e) => updateNestedData('emergencyContact', 'relationship', e.target.value)}
                        placeholder="e.g., Parent, Guardian"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Phone Number *</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={applicationData.emergencyContact.phone}
                        onChange={(e) => updateNestedData('emergencyContact', 'phone', e.target.value)}
                        placeholder="+675 XXXX XXXX"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic History Step */}
            {currentStep === 'academic' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Academic History
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastSchool">Last School Attended *</Label>
                    <Input
                      id="lastSchool"
                      value={applicationData.lastSchoolAttended}
                      onChange={(e) => updateApplicationData('lastSchoolAttended', e.target.value)}
                      placeholder="Name of your last school"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearCompleted">Year Completed *</Label>
                    <Input
                      id="yearCompleted"
                      type="number"
                      min="1990"
                      max="2024"
                      value={applicationData.yearCompleted}
                      onChange={(e) => updateApplicationData('yearCompleted', e.target.value)}
                      placeholder="e.g., 2023"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualification">Highest Qualification *</Label>
                    <Select value={applicationData.qualificationLevel} onValueChange={(value) => updateApplicationData('qualificationLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grade-10">Grade 10</SelectItem>
                        <SelectItem value="grade-12">Grade 12</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="degree">Degree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grades">Grades/Results</Label>
                    <Input
                      id="grades"
                      value={applicationData.grades}
                      onChange={(e) => updateApplicationData('grades', e.target.value)}
                      placeholder="e.g., A, B+, 85%"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-900">Document Requirements</h3>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Academic transcripts or certificates</li>
                    <li>• Birth certificate or valid ID</li>
                    <li>• Character reference letters (2)</li>
                    <li>• Passport-sized photographs (2)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Documents Step */}
            {currentStep === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Required Documents
                  </h2>
                  <p className="text-gray-600">
                    Please upload the required documents to support your application.
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Academic Transcript */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2" />
                        Academic Transcript *
                      </CardTitle>
                      <CardDescription>
                        Official transcript from your last completed education
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applicationData.transcriptUrl ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium">{applicationData.transcriptUrl}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationData('transcriptUrl', '')}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">
                            Upload your official academic transcript
                          </p>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleDocumentUpload(e, 'transcript')}
                            className="hidden"
                            id="transcript-upload"
                          />
                          <label
                            htmlFor="transcript-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Upload Transcript
                          </label>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Accepted formats: PDF, JPG, PNG (max 10MB)
                      </p>
                    </CardContent>
                  </Card>

                  {/* ID Copy */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        ID Copy *
                      </CardTitle>
                      <CardDescription>
                        Copy of your passport, driver's license, or national ID
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applicationData.idCopyUrl ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium">{applicationData.idCopyUrl}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationData('idCopyUrl', '')}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <User className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">
                            Upload a copy of your identification document
                          </p>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleDocumentUpload(e, 'idCopy')}
                            className="hidden"
                            id="id-upload"
                          />
                          <label
                            htmlFor="id-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Upload ID Copy
                          </label>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Clear, readable copy of passport, driver's license, or national ID
                      </p>
                    </CardContent>
                  </Card>

                  {/* Reference Letters */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Reference Letter 1</CardTitle>
                        <CardDescription>
                          Letter from academic or professional referee
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {applicationData.referenceLetter1Url ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">{applicationData.referenceLetter1Url}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationData('referenceLetter1Url', '')}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => handleDocumentUpload(e, 'referenceLetter1')}
                              className="hidden"
                              id="ref1-upload"
                            />
                            <label
                              htmlFor="ref1-upload"
                              className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                            >
                              Upload Letter
                            </label>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Reference Letter 2</CardTitle>
                        <CardDescription>
                          Additional reference letter (optional)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {applicationData.referenceLetter2Url ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">{applicationData.referenceLetter2Url}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationData('referenceLetter2Url', '')}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => handleDocumentUpload(e, 'referenceLetter2')}
                              className="hidden"
                              id="ref2-upload"
                            />
                            <label
                              htmlFor="ref2-upload"
                              className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                            >
                              Upload Letter
                            </label>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Other Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Other Supporting Documents</CardTitle>
                      <CardDescription>
                        Additional certificates, awards, or relevant documents (optional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applicationData.otherDocumentsUrl ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium">{applicationData.otherDocumentsUrl}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationData('otherDocumentsUrl', '')}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">
                            Upload any additional supporting documents
                          </p>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleDocumentUpload(e, 'otherDocuments')}
                            className="hidden"
                            id="other-upload"
                          />
                          <label
                            htmlFor="other-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Upload Documents
                          </label>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Certificates, awards, work experience letters, etc.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900">Document Guidelines</h4>
                      <ul className="text-sm text-blue-800 mt-1 space-y-1">
                        <li>• All documents must be clear and readable</li>
                        <li>• Documents in other languages must include English translations</li>
                        <li>• File size limit: 10MB per document</li>
                        <li>• Accepted formats: PDF, JPG, PNG</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Program Selection Step */}
            {currentStep === 'program' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Program Selection
                  </h2>
                </div>

                <div className="grid gap-6">
                  {/* Department Selection */}
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={applicationData.departmentId || ''}
                      onValueChange={(value) => {
                        updateApplicationData('departmentId', value)
                        // Reset program selection when department changes
                        updateApplicationData('programId', '')
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department first" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{department.code}</Badge>
                              <span>{department.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {departments.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        No departments available. Please contact administration.
                      </p>
                    )}
                  </div>

                  {/* Program Selection */}
                  <div>
                    <Label htmlFor="program">Program *</Label>
                    <Select
                      value={applicationData.programId || ''}
                      onValueChange={(value) => updateApplicationData('programId', value)}
                      disabled={!applicationData.departmentId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !applicationData.departmentId
                            ? "Select department first"
                            : "Select your program"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {programs
                          .filter(program => program.department_id === applicationData.departmentId)
                          .map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              <div className="flex flex-col items-start space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="default">{program.code}</Badge>
                                  <span className="font-medium">{program.name}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                  <span>Duration: {program.duration_years} year{program.duration_years !== 1 ? 's' : ''}</span>
                                  <span>Level: {program.level || 'Diploma'}</span>
                                </div>
                                {program.description && (
                                  <p className="text-xs text-gray-500 max-w-md">
                                    {program.description}
                                  </p>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {/* Show selected program details */}
                    {applicationData.programId && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        {(() => {
                          const selectedProgram = programs.find(p => p.id === applicationData.programId)
                          const selectedDepartment = departments.find(d => d.id === applicationData.departmentId)
                          return selectedProgram ? (
                            <div>
                              <h4 className="font-medium text-blue-900">{selectedProgram.name}</h4>
                              <div className="text-sm text-blue-800 mt-1 space-y-1">
                                <p><strong>Department:</strong> {selectedDepartment?.name}</p>
                                <p><strong>Duration:</strong> {selectedProgram.duration_years} year{selectedProgram.duration_years !== 1 ? 's' : ''}</p>
                                <p><strong>Code:</strong> {selectedProgram.code}</p>
                                {selectedProgram.description && (
                                  <p><strong>Description:</strong> {selectedProgram.description}</p>
                                )}
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}

                    {applicationData.departmentId && programs.filter(p => p.department_id === applicationData.departmentId).length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        No programs available for the selected department.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="intakePeriod">Intake Period *</Label>
                    <Select value={applicationData.intakePeriod} onValueChange={(value) => updateApplicationData('intakePeriod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intake period" />
                      </SelectTrigger>
                      <SelectContent>
                        {intakePeriods
                          .filter(period => period.status === 'open' || period.status === 'upcoming')
                          .map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.name} {period.status === 'upcoming' && '(Upcoming)'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="residency">Accommodation *</Label>
                    <Select value={applicationData.residencyStatus} onValueChange={(value) => updateApplicationData('residencyStatus', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accommodation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day Student (No accommodation)</SelectItem>
                        <SelectItem value="boarding">Boarding (On-campus housing)</SelectItem>
                        <SelectItem value="lodging">Lodging (Off-campus approved)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Biometric Data Step */}
            {currentStep === 'biometric' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Biometric Data
                  </h2>
                  <p className="text-gray-600">
                    Please provide your photo and biometric information for verification purposes.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Photo Capture */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Camera className="h-5 w-5 mr-2" />
                        Student Photo
                      </CardTitle>
                      <CardDescription>
                        Take or upload a clear, recent passport-style photo
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        {applicationData.photoUrl ? (
                          <div className="space-y-4">
                            <img
                              src={applicationData.photoUrl}
                              alt="Student photo"
                              className="w-32 h-40 object-cover mx-auto rounded-lg border"
                            />
                            <Button
                              variant="outline"
                              onClick={() => updateApplicationData('photoUrl', '')}
                            >
                              Remove Photo
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Camera className="h-16 w-16 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                Click to take photo or upload image
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                capture="user"
                                onChange={(e) => handlePhotoUpload(e)}
                                className="hidden"
                                id="photo-upload"
                              />
                              <label
                                htmlFor="photo-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Capture Photo
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Photo should be in passport style (head and shoulders)</p>
                        <p>• Face should be clearly visible and well-lit</p>
                        <p>• Supported formats: JPG, PNG (max 5MB)</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fingerprint Capture (Future Implementation) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Fingerprint (Optional)
                      </CardTitle>
                      <CardDescription>
                        Fingerprint capture for enhanced security (available on campus)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                            <User className="h-8 w-8 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Fingerprint capture will be completed during campus visit
                            </p>
                            <Badge variant="secondary">Available on Campus</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Fingerprint capture is optional for online applications</p>
                        <p>• Can be completed during document verification</p>
                        <p>• Required for certain programs and security clearance</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900">Privacy Notice</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Your biometric data is securely stored and used only for identity verification
                        and academic purposes. We comply with PNG data protection regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h2>
                  <p className="text-gray-600">
                    Complete your registration by paying the required fees.
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Fee Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fee Summary</CardTitle>
                      <CardDescription>
                        Required fees for your selected program
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span>Application Fee</span>
                          <span className="font-medium">K 50.00</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Registration Fee</span>
                          <span className="font-medium">K 200.00</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Program Fee (First Semester)</span>
                          <span className="font-medium">K 800.00</span>
                        </div>
                        {applicationData.residencyStatus === 'boarding' && (
                          <div className="flex justify-between py-2 border-b">
                            <span>Accommodation Fee</span>
                            <span className="font-medium">K 400.00</span>
                          </div>
                        )}
                        <div className="flex justify-between py-3 border-t-2 font-semibold text-lg">
                          <span>Total Amount</span>
                          <span>K {applicationData.residencyStatus === 'boarding' ? '1,450.00' : '1,050.00'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Methods */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                      <CardDescription>
                        Choose your preferred payment option
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="bank_deposit"
                              className="text-blue-600"
                              onChange={(e) => updateApplicationData('paymentMethod', e.target.value)}
                            />
                            <div>
                              <p className="font-medium">Bank Deposit</p>
                              <p className="text-sm text-gray-600">
                                Deposit funds directly to our bank account
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="campus"
                              className="text-blue-600"
                              onChange={(e) => updateApplicationData('paymentMethod', e.target.value)}
                            />
                            <div>
                              <p className="font-medium">Campus Payment</p>
                              <p className="text-sm text-gray-600">
                                Pay at the campus finance office
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 opacity-50">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="online"
                              disabled
                              className="text-blue-600"
                            />
                            <div>
                              <p className="font-medium">Online Payment</p>
                              <p className="text-sm text-gray-600">
                                Credit/Debit card payment (Coming Soon)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {applicationData.paymentMethod === 'bank_deposit' && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">Bank Details</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Bank:</strong> Bank South Pacific (BSP)</div>
                            <div><strong>Account Name:</strong> National Polytechnic Institute PNG</div>
                            <div><strong>Account Number:</strong> 1234567890</div>
                            <div><strong>Reference:</strong> {`${applicationData.firstName} ${applicationData.lastName}` || 'Your Name'} - Registration</div>
                          </div>
                          <div className="mt-4">
                            <Label htmlFor="receiptUpload">Upload Payment Receipt *</Label>
                            <input
                              type="file"
                              id="receiptUpload"
                              accept="image/*,.pdf"
                              onChange={(e) => handleReceiptUpload(e)}
                              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          </div>
                        </div>
                      )}

                      {applicationData.paymentMethod === 'campus' && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-3">Campus Payment Instructions</h4>
                          <div className="space-y-2 text-sm text-green-800">
                            <p>1. Visit the Finance Office at NPI PNG campus</p>
                            <p>2. Present this application reference: <strong>{applicationData.email}</strong></p>
                            <p>3. Pay the total amount: <strong>K {applicationData.residencyStatus === 'boarding' ? '1,450.00' : '1,050.00'}</strong></p>
                            <p>4. Keep your receipt for records</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Review Application
                  </h2>
                  <p className="text-gray-600">
                    Please review your application details before submitting.
                  </p>
                </div>

                {/* Review content will be added here */}
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Name:</strong> {`${applicationData.firstName} ${applicationData.lastName}`}</div>
                        <div><strong>Date of Birth:</strong> {applicationData.dateOfBirth}</div>
                        <div><strong>Gender:</strong> {applicationData.gender}</div>
                        <div><strong>Email:</strong> {applicationData.email}</div>
                        <div><strong>Phone:</strong> {applicationData.phone}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Program & Academic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Last School:</strong> {applicationData.lastSchoolAttended}</div>
                        <div><strong>Year Completed:</strong> {applicationData.yearCompleted}</div>
                        <div><strong>Selected Program:</strong> {programs.find(p => p.id === applicationData.programId)?.name}</div>
                        <div><strong>Accommodation:</strong> {applicationData.residencyStatus}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-green-900">Ready to Submit</h4>
                        <p className="text-sm text-green-800 mt-1">
                          Your application is complete and ready for submission.
                          You will receive a confirmation email once submitted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 'personal'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === 'review' ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
