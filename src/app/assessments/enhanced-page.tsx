'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CalendarIcon,
  CalendarDays,
  PlusIcon,
  EditIcon,
  UsersIcon,
  BarChart3Icon,
  GraduationCapIcon,
  AlertCircleIcon,
  FileTextIcon,
  PrinterIcon,
  DownloadIcon,
  CalculatorIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  Settings,
  Save
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useAuth } from '@/contexts/AuthContext'
import { CourseService, type CourseWithDetails } from '@/lib/services/courses'
import { DepartmentService, type DepartmentWithDetails } from '@/lib/services/departments'
import { ProgramService, type ProgramWithDetails } from '@/lib/services/programs'
import { TVETAcademicCalendarService, type TVETAcademicYear, type TVETTerm, type CurrentTVETContext } from '@/lib/services/tvet-academic-calendar'
import {
  EnhancedAssessmentService,
  type AssessmentType,
  type GradeScale,
  type EnhancedAssessmentConfig,
  type AssessmentWeighting,
  type CourseAnalytics,
  type ValidationRule
} from '@/lib/services/enhanced-assessments'

interface AssessmentConfigFormData {
  course_id: string
  academic_year_id: string
  semester_id: string
  total_marks: number
  pass_threshold: number
  honor_threshold: number
  grade_scale_id: string
  weightings: AssessmentWeighting[]
}

export default function EnhancedAssessmentPage() {
  const { user } = useAuth()
  const router = useRouter()

  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentContext, setCurrentContext] = useState<CurrentTVETContext | null>(null)

  // Data states
  const [courses, setCourses] = useState<CourseWithDetails[]>([])
  const [departments, setDepartments] = useState<DepartmentWithDetails[]>([])
  const [academicYears, setAcademicYears] = useState<TVETAcademicYear[]>([])
  const [terms, setTerms] = useState<TVETTerm[]>([])
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([])
  const [gradeScales, setGradeScales] = useState<GradeScale[]>([])
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([])

  // Form states
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [assessmentConfig, setAssessmentConfig] = useState<EnhancedAssessmentConfig | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [configFormData, setConfigFormData] = useState<AssessmentConfigFormData>({
    course_id: '',
    academic_year_id: '',
    semester_id: '',
    total_marks: 100,
    pass_threshold: 50,
    honor_threshold: 80,
    grade_scale_id: '',
    weightings: []
  })

  // Analytics state
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          currentContextData,
          coursesData,
          departmentsData,
          academicYearsData,
          assessmentTypesData,
          gradeScalesData,
          validationRulesData
        ] = await Promise.all([
          TVETAcademicCalendarService.getCurrentTVETContext(),
          CourseService.getAllCourses(),
          DepartmentService.getAllDepartments(),
          TVETAcademicCalendarService.getAllTVETAcademicYears(),
          EnhancedAssessmentService.getAssessmentTypes(),
          EnhancedAssessmentService.getGradeScales(),
          EnhancedAssessmentService.getValidationRules()
        ])

        setCurrentContext(currentContextData)
        setCourses(coursesData)
        setDepartments(departmentsData)
        setAcademicYears(academicYearsData)
        setAssessmentTypes(assessmentTypesData)
        setGradeScales(gradeScalesData)
        setValidationRules(validationRulesData)

        if (currentContextData) {
          setSelectedYear(currentContextData.academic_year_id)
          setSelectedTerm(currentContextData.term_id)

          // Load terms for current year
          const termsData = await TVETAcademicCalendarService.getTVETTermsByYear(currentContextData.academic_year_id)
          setTerms(termsData)
        }

        // Initialize form data with defaults
        if (gradeScalesData.length > 0) {
          setConfigFormData(prev => ({
            ...prev,
            grade_scale_id: gradeScalesData[0].id
          }))
        }

      } catch (error: any) {
        console.error('Error loading assessment data:', error)
        setError(error.message || 'Failed to load assessment system')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Load terms when year changes
  useEffect(() => {
    const loadTerms = async () => {
      if (selectedYear) {
        try {
          const termsData = await TVETAcademicCalendarService.getTVETTermsByYear(selectedYear)
          setTerms(termsData)
        } catch (error: any) {
          console.error('Error loading terms:', error)
        }
      }
    }

    loadTerms()
  }, [selectedYear])

  // Load assessment configuration when course/semester changes
  useEffect(() => {
    const loadAssessmentConfig = async () => {
      if (selectedCourse && selectedYear && selectedTerm) {
        try {
          const config = await EnhancedAssessmentService.getAssessmentConfig(
            selectedCourse,
            selectedYear,
            selectedTerm
          )

          setAssessmentConfig(config)

          if (config) {
            setConfigFormData({
              course_id: config.course_id,
              academic_year_id: config.academic_year_id,
              semester_id: config.semester_id,
              total_marks: config.total_marks,
              pass_threshold: config.pass_threshold,
              honor_threshold: config.honor_threshold,
              grade_scale_id: config.grade_scale_id,
              weightings: config.weightings
            })
          } else {
            // Load default configuration
            const defaultConfig = await EnhancedAssessmentService.getDefaultAssessmentConfig()
            setConfigFormData({
              course_id: selectedCourse,
              academic_year_id: selectedYear,
              semester_id: selectedTerm,
              total_marks: defaultConfig.total_marks || 100,
              pass_threshold: defaultConfig.pass_threshold || 50,
              honor_threshold: defaultConfig.honor_threshold || 80,
              grade_scale_id: defaultConfig.grade_scale_id || (gradeScales[0]?.id || ''),
              weightings: defaultConfig.weightings || []
            })
          }

          // Load analytics
          const analytics = await EnhancedAssessmentService.getCourseAnalytics(
            selectedCourse,
            selectedYear,
            selectedTerm
          )
          setCourseAnalytics(analytics)

        } catch (error: any) {
          console.error('Error loading assessment configuration:', error)
        }
      }
    }

    loadAssessmentConfig()
  }, [selectedCourse, selectedYear, selectedTerm, gradeScales])

  // Handle adding new assessment weighting
  const addAssessmentWeighting = () => {
    if (assessmentTypes.length === 0) return

    const newWeighting: AssessmentWeighting = {
      id: `new-${Date.now()}`,
      assessment_type_id: assessmentTypes[0].id,
      weight_percentage: 20,
      max_marks: 100,
      number_of_assessments: 1,
      is_active: true
    } as AssessmentWeighting

    setConfigFormData(prev => ({
      ...prev,
      weightings: [...prev.weightings, newWeighting]
    }))
  }

  // Handle removing assessment weighting
  const removeAssessmentWeighting = (index: number) => {
    setConfigFormData(prev => ({
      ...prev,
      weightings: prev.weightings.filter((_, i) => i !== index)
    }))
  }

  // Handle updating assessment weighting
  const updateAssessmentWeighting = (index: number, field: keyof AssessmentWeighting, value: any) => {
    setConfigFormData(prev => ({
      ...prev,
      weightings: prev.weightings.map((weighting, i) =>
        i === index ? { ...weighting, [field]: value } : weighting
      )
    }))
  }

  // Validate configuration
  const validateConfiguration = async () => {
    try {
      const validation = await EnhancedAssessmentService.validateAssessmentConfig(configFormData)
      setValidationErrors(validation.errors)
      return validation.isValid
    } catch (error: any) {
      setValidationErrors([error.message || 'Validation failed'])
      return false
    }
  }

  // Save assessment configuration
  const saveAssessmentConfiguration = async () => {
    try {
      const isValid = await validateConfiguration()
      if (!isValid) {
        return
      }

      setLoading(true)
      const savedConfig = await EnhancedAssessmentService.saveAssessmentConfig(configFormData)
      setAssessmentConfig(savedConfig)
      setIsConfigDialogOpen(false)
      setValidationErrors([])

      // Reload analytics
      const analytics = await EnhancedAssessmentService.getCourseAnalytics(
        selectedCourse,
        selectedYear,
        selectedTerm
      )
      setCourseAnalytics(analytics)

    } catch (error: any) {
      setError(error.message || 'Failed to save assessment configuration')
    } finally {
      setLoading(false)
    }
  }

  // Calculate total weight
  const totalWeight = configFormData.weightings.reduce((sum, w) => sum + w.weight_percentage, 0)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading enhanced assessment system...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="w-5 h-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Assessment System</h1>
          <p className="text-gray-600">Database-driven TVET Assessment Management</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Database-Driven Assessment Configuration</DialogTitle>
                <DialogDescription>
                  Setup assessment components and grading criteria using database-driven options
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="w-5 h-5" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Basic Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_marks">Total Marks</Label>
                    <Input
                      id="total_marks"
                      type="number"
                      value={configFormData.total_marks}
                      onChange={(e) => setConfigFormData(prev => ({
                        ...prev,
                        total_marks: parseFloat(e.target.value) || 100
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade_scale">Grade Scale</Label>
                    <Select
                      value={configFormData.grade_scale_id}
                      onValueChange={(value) => setConfigFormData(prev => ({
                        ...prev,
                        grade_scale_id: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade scale" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeScales.map((scale) => (
                          <SelectItem key={scale.id} value={scale.id}>
                            {scale.grade_name} ({scale.grade_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pass_threshold">Pass Threshold (%)</Label>
                    <Input
                      id="pass_threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={configFormData.pass_threshold}
                      onChange={(e) => setConfigFormData(prev => ({
                        ...prev,
                        pass_threshold: parseFloat(e.target.value) || 50
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="honor_threshold">Honor Threshold (%)</Label>
                    <Input
                      id="honor_threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={configFormData.honor_threshold}
                      onChange={(e) => setConfigFormData(prev => ({
                        ...prev,
                        honor_threshold: parseFloat(e.target.value) || 80
                      }))}
                    />
                  </div>
                </div>

                {/* Assessment Weightings */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Assessment Weightings</h3>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-sm font-medium",
                        Math.abs(totalWeight - 100) < 0.01 ? "text-green-600" : "text-red-600"
                      )}>
                        Total: {totalWeight.toFixed(1)}%
                      </span>
                      <Button onClick={addAssessmentWeighting} size="sm">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Assessment
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {configFormData.weightings.map((weighting, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-5 gap-4 items-end">
                          <div>
                            <Label>Assessment Type</Label>
                            <Select
                              value={weighting.assessment_type_id}
                              onValueChange={(value) => updateAssessmentWeighting(index, 'assessment_type_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {assessmentTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.type_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Weight (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={weighting.weight_percentage}
                              onChange={(e) => updateAssessmentWeighting(
                                index,
                                'weight_percentage',
                                parseFloat(e.target.value) || 0
                              )}
                            />
                          </div>
                          <div>
                            <Label>Max Marks</Label>
                            <Input
                              type="number"
                              min="1"
                              value={weighting.max_marks}
                              onChange={(e) => updateAssessmentWeighting(
                                index,
                                'max_marks',
                                parseFloat(e.target.value) || 100
                              )}
                            />
                          </div>
                          <div>
                            <Label>Count</Label>
                            <Input
                              type="number"
                              min="1"
                              value={weighting.number_of_assessments}
                              onChange={(e) => updateAssessmentWeighting(
                                index,
                                'number_of_assessments',
                                parseInt(e.target.value) || 1
                              )}
                            />
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAssessmentWeighting(index)}
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Weight Progress */}
                  <div className="mt-4">
                    <Label>Total Weight Distribution</Label>
                    <Progress
                      value={Math.min(totalWeight, 100)}
                      className={cn(
                        "h-3",
                        Math.abs(totalWeight - 100) < 0.01 ? "bg-green-100" : "bg-red-100"
                      )}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span className={Math.abs(totalWeight - 100) < 0.01 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {totalWeight.toFixed(1)}%
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveAssessmentConfiguration} disabled={Math.abs(totalWeight - 100) > 0.01}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={() => console.log('Generate result sheet')}>
            <PrinterIcon className="w-4 h-4 mr-2" />
            Generate Result Sheet
          </Button>
        </div>
      </div>

      {/* Current Academic Context */}
      {currentContext && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Current Academic Context</h3>
                  <p className="text-blue-600">
                    {currentContext.year_name} • {currentContext.term_name}
                    ({new Date(currentContext.lecturing_starts).toLocaleDateString()} - {new Date(currentContext.college_closes).toLocaleDateString()})
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                {currentContext.program_type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Course & Term Selection</CardTitle>
          <CardDescription>Select course and academic period for assessment management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="course-select">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year-select">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_code} - {year.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="term-select">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.term_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Configuration Status */}
      {selectedCourse && selectedYear && selectedTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {assessmentConfig ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircleIcon className="w-5 h-5 text-orange-600" />
              )}
              Assessment Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentConfig ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Total Marks</Label>
                    <p className="font-semibold">{assessmentConfig.total_marks}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Pass Threshold</Label>
                    <p className="font-semibold">{assessmentConfig.pass_threshold}%</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Honor Threshold</Label>
                    <p className="font-semibold">{assessmentConfig.honor_threshold}%</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Assessment Types</Label>
                    <p className="font-semibold">{assessmentConfig.weightings.length}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Assessment Breakdown</Label>
                  <div className="mt-2 space-y-2">
                    {assessmentConfig.weightings.map((weighting, index) => {
                      const assessmentType = assessmentTypes.find(t => t.id === weighting.assessment_type_id)
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{assessmentType?.type_name}</span>
                          <span className="text-sm text-gray-600">
                            {weighting.weight_percentage}% • {weighting.max_marks} marks • {weighting.number_of_assessments} assessment(s)
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircleIcon className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessment Configuration</h3>
                <p className="text-gray-600 mb-4">
                  This course does not have an assessment configuration for the selected term.
                </p>
                <Button onClick={() => setIsConfigDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Create Configuration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Analytics */}
      {courseAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5" />
              Course Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{courseAnalytics.total_students}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{courseAnalytics.average_score.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{courseAnalytics.pass_rate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Pass Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{courseAnalytics.honor_rate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Honor Rate</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Grade Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(courseAnalytics.grade_distribution).map(([grade, count]) => (
                    <div key={grade} className="flex justify-between items-center">
                      <span className="font-medium">{grade}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / courseAnalytics.total_students) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Assessment Completion Rates</h4>
                <div className="space-y-2">
                  {Object.entries(courseAnalytics.assessment_completion_rates).map(([assessment, rate]) => (
                    <div key={assessment} className="flex justify-between items-center">
                      <span className="font-medium">{assessment}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Database-Driven Assessment Types</CardTitle>
          <CardDescription>Assessment types loaded from database configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessmentTypes.map((type) => (
              <Card key={type.id} className="p-4 border-l-4 border-l-blue-500">
                <h4 className="font-semibold">{type.type_name}</h4>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <div className="text-xs text-gray-500">
                  <p>Default Weight: {type.default_weight}%</p>
                  <p>Range: {type.min_weight}% - {type.max_weight}%</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
