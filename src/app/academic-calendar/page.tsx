'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Settings,
  CheckCircle,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Users,
  Calculator
} from 'lucide-react'
import {
  TVETAcademicCalendarService,
  type TVETAcademicYear,
  type TVETTerm,
  type CreateTVETYearData,
  type CreateTVETTermData,
  type ProgramType,
  type SystemConfiguration,
  type CurrentTVETContext,
  type TVETTermWeek,
  type TVETSupplementaryPeriod,
  type TVETAcademicEvent
} from '@/lib/services/tvet-academic-calendar'

export default function TVETAcademicCalendarPage() {
  const { user } = useAuth()

  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Data state
  const [academicYears, setAcademicYears] = useState<TVETAcademicYear[]>([])
  const [currentContext, setCurrentContext] = useState<CurrentTVETContext | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [terms, setTerms] = useState<TVETTerm[]>([])
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [weeks, setWeeks] = useState<TVETTermWeek[]>([])
  const [supplementaryPeriods, setSupplementaryPeriods] = useState<TVETSupplementaryPeriod[]>([])
  const [events, setEvents] = useState<TVETAcademicEvent[]>([])
  const [calendarOverview, setCalendarOverview] = useState<any[]>([])

  // Dialog states
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false)
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false)
  const [isSupplementaryDialogOpen, setIsSupplementaryDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [yearForm, setYearForm] = useState<CreateTVETYearData>({
    year_code: '',
    year_name: '',
    start_date: '',
    end_date: '',
    program_type_id: '',
    description: ''
  })

  const [termForm, setTermForm] = useState<CreateTVETTermData>({
    academic_year_id: '',
    term_code: '',
    term_name: '',
    term_number: 1,
    semester_group: 1,
    lecturing_starts: '',
    classes_commence: '',
    lectures_end_exam_start: '',
    college_closes: '',
    lecturing_staff_days: 0,
    total_staff_service_days: 0,
    description: ''
  })

  // Dynamic configuration state
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([])
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(null)
  const [defaultProgramType, setDefaultProgramType] = useState<ProgramType | null>(null)

  useEffect(() => {
    loadData()
    loadConfiguration()
  }, [])

  useEffect(() => {
    if (selectedYear) {
      loadTerms(selectedYear)
    }
  }, [selectedYear])

  useEffect(() => {
    if (selectedTerm) {
      loadTermData(selectedTerm)
    }
  }, [selectedTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [yearsData, contextData, overviewData] = await Promise.allSettled([
        TVETAcademicCalendarService.getAllTVETAcademicYears(),
        TVETAcademicCalendarService.getCurrentTVETContext(),
        TVETAcademicCalendarService.getTVETCalendarOverview()
      ])

      if (yearsData.status === 'fulfilled') {
        setAcademicYears(yearsData.value)
        // Set selected year to current year if available
        const currentYear = yearsData.value.find(y => y.is_current)
        if (currentYear) {
          setSelectedYear(currentYear.id)
        }
      }

      if (contextData.status === 'fulfilled') {
        setCurrentContext(contextData.value)
      }

      if (overviewData.status === 'fulfilled') {
        setCalendarOverview(overviewData.value)
      }

    } catch (err) {
      console.error('Error loading TVET academic calendar data:', err)
      setError('Failed to load TVET academic calendar data')
    } finally {
      setLoading(false)
    }
  }

  const loadTerms = async (yearId: string) => {
    try {
      const data = await TVETAcademicCalendarService.getTVETTermsByYear(yearId)
      setTerms(data)

      // Set selected term to current if available
      const currentTerm = data.find(t => t.is_current)
      if (currentTerm) {
        setSelectedTerm(currentTerm.id)
      } else if (data.length > 0) {
        setSelectedTerm(data[0].id)
      }
    } catch (error: any) {
      console.error('Error loading TVET terms:', error)
    }
  }

  const loadTermData = async (termId: string) => {
    try {
      const [weeksData, supplementaryData] = await Promise.allSettled([
        TVETAcademicCalendarService.getTVETWeeksByTerm(termId),
        selectedYear ? TVETAcademicCalendarService.getTVETSupplementaryPeriods(selectedYear) : Promise.resolve([])
      ])

      if (weeksData.status === 'fulfilled') {
        setWeeks(weeksData.value)
      }

      if (supplementaryData.status === 'fulfilled') {
        setSupplementaryPeriods(supplementaryData.value)
      }
    } catch (error: any) {
      console.error('Error loading TVET term data:', error)
    }
  }

  const loadConfiguration = async () => {
    try {
      const [programTypesData, configData] = await Promise.all([
        TVETAcademicCalendarService.getProgramTypes(),
        TVETAcademicCalendarService.getSystemConfiguration()
      ])

      setProgramTypes(programTypesData)
      setSystemConfig(configData)

      // Set default program type
      const defaultType = programTypesData.find(pt => pt.code === configData.default_program_type) || programTypesData[0]
      setDefaultProgramType(defaultType)

      if (defaultType) {
        setYearForm(prev => ({ ...prev, program_type_id: defaultType.id }))
      }
    } catch (error) {
      console.error('Error loading configuration:', error)
    }
  }

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await TVETAcademicCalendarService.createTVETAcademicYear(yearForm)
      setIsYearDialogOpen(false)
      setYearForm({
        year_code: '',
        year_name: '',
        start_date: '',
        end_date: '',
        program_type_id: '',
        description: ''
      })
      await loadData()
      alert('TVET academic year created successfully!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await TVETAcademicCalendarService.createTVETTerm({
        ...termForm,
        academic_year_id: selectedYear
      })
      setIsTermDialogOpen(false)
      setTermForm({
        academic_year_id: '',
        term_code: '',
        term_name: '',
        term_number: 1,
        semester_group: 1,
        lecturing_starts: '',
        classes_commence: '',
        lectures_end_exam_start: '',
        college_closes: '',
        lecturing_staff_days: 0,
        total_staff_service_days: 0,
        description: ''
      })
      await loadTerms(selectedYear)
      alert('TVET term created successfully!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateWeeks = async (termId: string) => {
    try {
      setIsSubmitting(true)
      const weeksCreated = await TVETAcademicCalendarService.generateTVETTermWeeks(termId)
      await loadTermData(termId)
      alert(`Generated ${weeksCreated} weeks successfully!`)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetCurrentYear = async (yearId: string) => {
    try {
      await TVETAcademicCalendarService.setCurrentTVETAcademicYear(yearId)
      await loadData()
      alert('Current TVET academic year updated!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleSetCurrentTerm = async (termId: string) => {
    try {
      await TVETAcademicCalendarService.setCurrentTVETTerm(termId)
      await loadData()
      alert('Current TVET term updated!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading TVET academic calendar...</p>
          </div>
        </div>
      </div>
    )
  }

  // Check authorization
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Restricted</h2>
            <p className="text-red-600">Only system administrators can manage the TVET academic calendar.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            TVET Academic Calendar Management
          </h1>
          <p className="text-gray-600 mt-2">Manage TVET academic years, terms, and NCV program schedules</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Academic Year
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create TVET Academic Year</DialogTitle>
                <DialogDescription>
                  Set up a new TVET academic year with NCV program structure
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateYear} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year_code">Year Code *</Label>
                    <Input
                      id="year_code"
                      value={yearForm.year_code}
                      onChange={(e) => setYearForm(prev => ({ ...prev, year_code: e.target.value }))}
                      placeholder="e.g., 2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="program_type">Program Type *</Label>
                    <Select
                      value={yearForm.program_type_id}
                      onValueChange={(value) => setYearForm(prev => ({ ...prev, program_type_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program type" />
                      </SelectTrigger>
                      <SelectContent>
                        {programTypes.map((programType) => (
                          <SelectItem key={programType.id} value={programType.id}>
                            {programType.name} ({programType.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="year_name">Year Name *</Label>
                  <Input
                    id="year_name"
                    value={yearForm.year_name}
                    onChange={(e) => setYearForm(prev => ({ ...prev, year_name: e.target.value }))}
                    placeholder="e.g., TVET College Academic Calendar – 2025 (NCV Program)"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Academic Year Start *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={yearForm.start_date}
                      onChange={(e) => setYearForm(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Academic Year End *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={yearForm.end_date}
                      onChange={(e) => setYearForm(prev => ({ ...prev, end_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={yearForm.description}
                    onChange={(e) => setYearForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
                {yearForm.program_type_id && defaultProgramType && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Program Configuration Preview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Total Annual Lecturing Days:</span>
                        <span className="font-medium ml-2">{defaultProgramType.default_lecturing_days}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Annual Staff Service Days:</span>
                        <span className="font-medium ml-2">{defaultProgramType.default_staff_service_days}</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      These values are configured for the {defaultProgramType.name} program type and will be applied automatically.
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsYearDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Year'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current TVET Context Display */}
      {currentContext && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Current TVET Academic Context</h3>
                  <p className="text-blue-600">
                    {currentContext.year_name} • {currentContext.term_name} ({currentContext.program_type})
                  </p>
                  <p className="text-sm text-blue-500">
                    Lecturing: {new Date(currentContext.lecturing_starts).toLocaleDateString()} - {new Date(currentContext.lectures_end_exam_start).toLocaleDateString()} |
                    College Closes: {new Date(currentContext.college_closes).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 mb-1">
                  {currentContext.lecturing_staff_days} lecturing days
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 block">
                  {currentContext.total_staff_service_days} staff service days
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="weeks">Weeks</TabsTrigger>
          <TabsTrigger value="supplementary">Supplementary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TVETOverview
            overview={calendarOverview}
            years={academicYears}
            currentContext={currentContext}
          />
        </TabsContent>

        <TabsContent value="years" className="space-y-6">
          <TVETYearsManagement
            years={academicYears}
            onSetCurrent={handleSetCurrentYear}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          <TVETTermsManagement
            years={academicYears}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            terms={terms}
            onSetCurrent={handleSetCurrentTerm}
            onCreateTerm={handleCreateTerm}
            onGenerateWeeks={handleGenerateWeeks}
            isSubmitting={isSubmitting}
            isTermDialogOpen={isTermDialogOpen}
            setIsTermDialogOpen={setIsTermDialogOpen}
            termForm={termForm}
            setTermForm={setTermForm}
          />
        </TabsContent>

        <TabsContent value="weeks" className="space-y-6">
          <TVETWeeksManagement
            selectedTerm={selectedTerm}
            weeks={weeks}
            terms={terms}
          />
        </TabsContent>

        <TabsContent value="supplementary" className="space-y-6">
          <TVETSupplementaryManagement
            supplementaryPeriods={supplementaryPeriods}
            selectedYear={selectedYear}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// TVET Overview Component
const TVETOverview = ({ overview, years, currentContext }: any) => (
  <div className="space-y-6">
    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Academic Years</p>
              <p className="text-2xl font-bold">{years.length}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Terms</p>
              <p className="text-2xl font-bold">{overview.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annual Lecturing Days</p>
              <p className="text-2xl font-bold">
                {currentContext?.total_lecturing_days ||
                 (years.length > 0 && years[0].total_lecturing_days) ||
                 'N/A'}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Service Days</p>
              <p className="text-2xl font-bold">
                {currentContext?.total_staff_service_days ||
                 (years.length > 0 && years[0].total_staff_service_days) ||
                 'N/A'}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* TVET Calendar Overview Table */}
    <Card>
      <CardHeader>
        <CardTitle>TVET Academic Calendar Overview</CardTitle>
        <CardDescription>Complete overview of terms and semesters for the TVET academic year</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Term / Semester</TableHead>
              <TableHead>Lecturing Starts</TableHead>
              <TableHead>Classes Commence</TableHead>
              <TableHead>Lectures End / Exam Start</TableHead>
              <TableHead>College Closes</TableHead>
              <TableHead>Lecturing Staff Days</TableHead>
              <TableHead>Total Staff Service Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overview.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.term_name}</TableCell>
                <TableCell>{new Date(item.lecturing_starts).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.classes_commence).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.lectures_end_exam_start).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.college_closes).toLocaleDateString()}</TableCell>
                <TableCell className="text-center">{item.lecturing_staff_days}</TableCell>
                <TableCell className="text-center">{item.total_staff_service_days}</TableCell>
              </TableRow>
            ))}
            {overview.length > 0 && (
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell>Total annual totals:</TableCell>
                <TableCell colSpan={4}>
                  {overview.reduce((sum: number, item: any) => sum + item.lecturing_staff_days, 0)} lecturing days, {' '}
                  {overview.reduce((sum: number, item: any) => sum + item.total_staff_service_days, 0)} staff service days
                </TableCell>
                <TableCell className="text-center">
                  {overview.reduce((sum: number, item: any) => sum + item.lecturing_staff_days, 0)}
                </TableCell>
                <TableCell className="text-center">
                  {overview.reduce((sum: number, item: any) => sum + item.total_staff_service_days, 0)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {/* Additional Notes Section */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          Additional Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-sm text-gray-700">
            <strong>Supplementary Exams for Term 1</strong> may be scheduled: 13 February – 8 March 2025
            <span className="text-xs text-gray-500 ml-2">Higher Education & Training</span>
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-sm text-gray-700">
            <strong>Life Skills & Computer Literacy (P2)</strong> course period: 3–7 November 2025 with exams between 10 November – 11 December
            <span className="text-xs text-gray-500 ml-2">Gaset</span>
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-sm text-gray-700">
            These dates may vary slightly across colleges due to local public holidays and institution-specific requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Placeholder components for other tabs
const TVETYearsManagement = ({ years, onSetCurrent, isSubmitting }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>TVET Academic Years Management</CardTitle>
      <CardDescription>Manage TVET academic years and set current year</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year Code</TableHead>
            <TableHead>Year Name</TableHead>
            <TableHead>Program Type</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Annual Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((year: TVETAcademicYear) => (
            <TableRow key={year.id}>
              <TableCell className="font-medium">{year.year_code}</TableCell>
              <TableCell>{year.year_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{year.program_type?.code || 'Unknown'}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm">
                <div>{year.total_lecturing_days || 0} lecturing</div>
                <div className="text-gray-500">{year.total_staff_service_days || 0} staff service</div>
              </TableCell>
              <TableCell>
                {year.is_current ? (
                  <Badge className="bg-green-100 text-green-800">Current</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {!year.is_current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSetCurrent(year.id)}
                      disabled={isSubmitting}
                    >
                      <Play className="h-4 w-4" />
                      Set Current
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)

// Additional placeholder components
const TVETTermsManagement = ({
  years,
  selectedYear,
  setSelectedYear,
  terms,
  onSetCurrent,
  onCreateTerm,
  onGenerateWeeks,
  isSubmitting,
  isTermDialogOpen,
  setIsTermDialogOpen,
  termForm,
  setTermForm
}: any) => (
  <div className="space-y-6">
    {/* Year Selection */}
    <Card>
      <CardHeader>
        <CardTitle>Select Academic Year</CardTitle>
        <CardDescription>Choose an academic year to manage its terms</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Select academic year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year: TVETAcademicYear) => (
              <SelectItem key={year.id} value={year.id}>
                {year.year_code} - {year.year_name} ({year.program_type?.code || 'Unknown'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>

    {selectedYear && (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>TVET Terms Management</CardTitle>
              <CardDescription>Manage terms for the selected academic year</CardDescription>
            </div>
            <Dialog open={isTermDialogOpen} onOpenChange={setIsTermDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Term
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create TVET Term</DialogTitle>
                  <DialogDescription>
                    Create a new term with TVET-specific date structure
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onCreateTerm} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="term_code">Term Code *</Label>
                      <Input
                        id="term_code"
                        value={termForm.term_code}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, term_code: e.target.value }))}
                        placeholder="e.g., TERM1_SEM1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="term_name">Term Name *</Label>
                      <Input
                        id="term_name"
                        value={termForm.term_name}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, term_name: e.target.value }))}
                        placeholder="e.g., Term 1 / Semester 1"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="term_number">Term Number *</Label>
                      <Select
                        value={termForm.term_number.toString()}
                        onValueChange={(value) => setTermForm((prev: any) => ({ ...prev, term_number: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Term 1</SelectItem>
                          <SelectItem value="2">Term 2</SelectItem>
                          <SelectItem value="3">Term 3</SelectItem>
                          <SelectItem value="4">Term 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="semester_group">Semester Group *</Label>
                      <Select
                        value={termForm.semester_group.toString()}
                        onValueChange={(value) => setTermForm((prev: any) => ({ ...prev, semester_group: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Semester 1 (Terms 1 & 2)</SelectItem>
                          <SelectItem value="2">Semester 2 (Terms 3 & 4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* TVET-specific dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lecturing_starts">Lecturing Starts *</Label>
                      <Input
                        id="lecturing_starts"
                        type="date"
                        value={termForm.lecturing_starts}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, lecturing_starts: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="classes_commence">Classes Commence *</Label>
                      <Input
                        id="classes_commence"
                        type="date"
                        value={termForm.classes_commence}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, classes_commence: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lectures_end_exam_start">Lectures End / Exam Start *</Label>
                      <Input
                        id="lectures_end_exam_start"
                        type="date"
                        value={termForm.lectures_end_exam_start}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, lectures_end_exam_start: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="college_closes">College Closes *</Label>
                      <Input
                        id="college_closes"
                        type="date"
                        value={termForm.college_closes}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, college_closes: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Staff service calculations */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lecturing_staff_days">Lecturing Staff Days *</Label>
                      <Input
                        id="lecturing_staff_days"
                        type="number"
                        value={termForm.lecturing_staff_days}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, lecturing_staff_days: parseInt(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_staff_service_days">Total Staff Service Days *</Label>
                      <Input
                        id="total_staff_service_days"
                        type="number"
                        value={termForm.total_staff_service_days}
                        onChange={(e) => setTermForm((prev: any) => ({ ...prev, total_staff_service_days: parseInt(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={termForm.description}
                      onChange={(e) => setTermForm((prev: any) => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsTermDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Term'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Semester Group</TableHead>
                <TableHead>Lecturing Period</TableHead>
                <TableHead>College Closes</TableHead>
                <TableHead>Staff Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terms.map((term: TVETTerm) => (
                <TableRow key={term.id}>
                  <TableCell>
                    <div className="font-medium">{term.term_name}</div>
                    <div className="text-sm text-gray-500">Term {term.term_number}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={term.semester_group === 1 ? "border-blue-300 text-blue-700" : "border-green-300 text-green-700"}>
                      Semester {term.semester_group}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{new Date(term.lecturing_starts).toLocaleDateString()} - {new Date(term.lectures_end_exam_start).toLocaleDateString()}</div>
                    <div className="text-gray-500">Classes: {new Date(term.classes_commence).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(term.college_closes).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{term.lecturing_staff_days} lecturing</div>
                    <div className="text-gray-500">{term.total_staff_service_days} total service</div>
                  </TableCell>
                  <TableCell>
                    {term.is_current ? (
                      <Badge className="bg-green-100 text-green-800">Current</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!term.is_current && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetCurrent(term.id)}
                          disabled={isSubmitting}
                        >
                          <Play className="h-4 w-4" />
                          Set Current
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onGenerateWeeks(term.id)}
                        disabled={isSubmitting}
                      >
                        <Calculator className="h-4 w-4" />
                        Generate Weeks
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {terms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No terms found for this academic year. Create your first term above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )}
  </div>
)

const TVETWeeksManagement = ({ selectedTerm, weeks, terms }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>TVET Weeks Management</CardTitle>
      <CardDescription>Manage lecturing weeks and staff service weeks</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">TVET weeks management interface will be implemented here.</p>
    </CardContent>
  </Card>
)

const TVETSupplementaryManagement = ({ supplementaryPeriods, selectedYear }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Supplementary Periods</CardTitle>
      <CardDescription>Manage supplementary exams and Life Skills periods</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">Supplementary periods management interface will be implemented here.</p>
    </CardContent>
  </Card>
)
