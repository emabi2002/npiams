'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  Award,
  Building,
  Calendar,
  Target,
  Activity,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

import {
  AnalyticsService,
  type ComprehensiveAnalytics,
  type DashboardFilters
} from '@/lib/services/analytics'
import { DepartmentService, type DepartmentWithDetails } from '@/lib/services/departments'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null)
  const [departments, setDepartments] = useState<DepartmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  // Filters
  const [filters, setFilters] = useState<DashboardFilters>({})
  const [dateRange, setDateRange] = useState('last30days')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadAnalytics()
    }
  }, [filters])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [analyticsData, departmentsData] = await Promise.all([
        AnalyticsService.getComprehensiveAnalytics(),
        DepartmentService.getAllDepartments()
      ])

      setAnalytics(analyticsData)
      setDepartments(departmentsData)
    } catch (error: any) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      setRefreshing(true)
      const analyticsData = await AnalyticsService.getComprehensiveAnalytics(filters)
      setAnalytics(analyticsData)
    } catch (error: any) {
      console.error('Error loading filtered analytics:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    await loadAnalytics()
  }

  const updateDateRange = (range: string) => {
    setDateRange(range)
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case 'last7days':
        startDate.setDate(now.getDate() - 7)
        break
      case 'last30days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'last90days':
        startDate.setDate(now.getDate() - 90)
        break
      case 'lastyear':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 10) / 10}%`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading analytics dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user can access analytics
  const canViewAnalytics = user?.role === 'admin' || user?.role === 'department_head'

  if (!canViewAnalytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">You don't have permission to view analytics.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart className="h-8 w-8 text-primary" />
            Real-Time Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into enrollment, performance, and institutional metrics
          </p>
          {analytics?.lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Dashboard Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={updateDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="lastyear">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={filters.department || 'all'}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  department: value === 'all' ? undefined : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academic-year">Academic Year</Label>
              <Select
                value={filters.academicYear || 'current'}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  academicYear: value === 'current' ? undefined : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Current Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Year</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term">Term</Label>
              <Select
                value={filters.term || 'all'}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  term: value === 'all' ? undefined : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                  <SelectItem value="term4">Term 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.enrollment.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">
                      +{analytics.enrollment.newEnrollments} this month
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.performance.overallGPA.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Pass Rate: {formatPercentage(analytics.performance.passRate)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.financial.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Outstanding: {formatCurrency(analytics.financial.outstandingFees)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.resources.activeCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    of {analytics.resources.totalCourses} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Instructors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.instructors.activeInstructors}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg {analytics.instructors.avgStudentsPerInstructor.toFixed(0)} students each
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(analytics.performance.completionRate)}</div>
                  <p className="text-xs text-muted-foreground">Assessment completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Department Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Enrollment Distribution</CardTitle>
                  <CardDescription>Student distribution across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.enrollment.departmentDistribution.slice(0, 5).map((dept, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{dept.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <Progress value={dept.percentage} className="h-2" />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[3rem]">
                            {dept.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Academic performance by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.departmentPerformance.slice(0, 5).map((dept, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{dept.department}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">GPA: {dept.gpa.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">
                              Pass: {formatPercentage(dept.passRate)}
                            </div>
                          </div>
                          <div className="w-2 h-8 rounded-full bg-muted overflow-hidden">
                            <div
                              className="bg-primary w-full transition-all duration-300"
                              style={{ height: `${(dept.gpa / 4) * 100}%`, marginTop: 'auto' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enrollment and Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Trend</CardTitle>
                  <CardDescription>Monthly enrollment over the last 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.enrollment.enrollmentTrend.slice(-6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(month.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32">
                            <Progress value={(month.count / Math.max(...analytics.enrollment.enrollmentTrend.map(m => m.count))) * 100} className="h-2" />
                          </div>
                          <span className="text-sm font-medium min-w-[2rem]">{month.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>Current utilization of institutional resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.resources.resourceUtilization.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{resource.resource}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <Progress value={resource.utilizationRate} className="h-2" />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[3rem]">
                            {resource.utilizationRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enrollment Tab */}
          <TabsContent value="enrollment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Students</span>
                    <span className="text-lg font-bold">{analytics.enrollment.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Students</span>
                    <span className="text-lg font-bold text-green-600">{analytics.enrollment.activeStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New This Month</span>
                    <span className="text-lg font-bold text-blue-600">{analytics.enrollment.newEnrollments}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NQF Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.enrollment.nqfLevelDistribution.map((level, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">Level {level.level}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={level.percentage} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground">{level.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Program Popularity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.enrollment.programDistribution.slice(0, 5).map((program, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{program.program}</span>
                          <span>{program.count}</span>
                        </div>
                        <Progress value={program.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trend Analysis</CardTitle>
                <CardDescription>Monthly enrollment patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {analytics.enrollment.enrollmentTrend.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {new Date(month.date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-sm text-muted-foreground">{month.count} new enrollments</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index > 0 && analytics.enrollment.enrollmentTrend[index - 1] && (
                          <>
                            {month.count > analytics.enrollment.enrollmentTrend[index - 1].count ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : month.count < analytics.enrollment.enrollmentTrend[index - 1].count ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <Activity className="h-4 w-4 text-gray-600" />
                            )}
                          </>
                        )}
                        <span className="text-lg font-bold">{month.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Overall GPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.performance.overallGPA.toFixed(2)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${(analytics.performance.overallGPA / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatPercentage(analytics.performance.passRate)}</div>
                  <Progress value={analytics.performance.passRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatPercentage(analytics.performance.completionRate)}</div>
                  <Progress value={analytics.performance.completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Assessment Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{analytics.performance.assessmentStats.length}</div>
                  <div className="text-sm text-muted-foreground">Different types</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Performance</CardTitle>
                  <CardDescription>Average scores by assessment type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.assessmentStats.map((assessment, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{assessment.type}</span>
                          <Badge variant="secondary" className="text-xs">{assessment.count}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <Progress value={assessment.avgScore} className="h-2" />
                          </div>
                          <span className="text-sm font-medium min-w-[3rem]">
                            {assessment.avgScore.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>GPA and pass rate trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.performance.performanceTrend.map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">
                            {new Date(period.period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">GPA: {period.gpa.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Pass: {period.passRate.toFixed(0)}%</div>
                          </div>
                          <div className="w-2 h-12 rounded-full bg-muted overflow-hidden">
                            <div
                              className="bg-primary w-full transition-all duration-300"
                              style={{ height: `${(period.gpa / 4) * 100}%`, marginTop: 'auto' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Program Performance Comparison</CardTitle>
                <CardDescription>Academic performance across all programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.performance.programPerformance.map((program, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="font-medium text-sm truncate" title={program.program}>
                        {program.program}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">GPA</span>
                        <span className="font-bold">{program.gpa.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Pass Rate</span>
                        <span className="font-bold">{formatPercentage(program.passRate)}</span>
                      </div>
                      <div className="pt-2">
                        <Progress value={(program.gpa / 4) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.financial.totalRevenue)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Fees Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.financial.paidFees)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercentage((analytics.financial.paidFees / analytics.financial.totalFees) * 100)} collected
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Outstanding</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(analytics.financial.outstandingFees)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercentage((analytics.financial.outstandingFees / analytics.financial.totalFees) * 100)} pending
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Collection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage((analytics.financial.paidFees / analytics.financial.totalFees) * 100)}
                  </div>
                  <Progress value={(analytics.financial.paidFees / analytics.financial.totalFees) * 100} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Department</CardTitle>
                  <CardDescription>Total revenue generated by each department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.financial.departmentRevenue.slice(0, 6).map((dept, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{dept.department}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(dept.amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatPercentage((dept.amount / analytics.financial.totalRevenue) * 100)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Program</CardTitle>
                  <CardDescription>Top revenue-generating programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.financial.programRevenue
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 6)
                      .map((program, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium truncate" title={program.program}>
                              {program.program}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(program.amount)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatPercentage((program.amount / analytics.financial.totalRevenue) * 100)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Trends</CardTitle>
                <CardDescription>Monthly payment collection over the last year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.financial.paymentTrend.slice(-12).map((month, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">
                            {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-lg font-bold">{formatCurrency(month.amount)}</div>
                        </div>
                        <div className="flex items-center">
                          {index > 0 && analytics.financial.paymentTrend[index - 1] && (
                            <>
                              {month.amount > analytics.financial.paymentTrend[index - 1].amount ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : month.amount < analytics.financial.paymentTrend[index - 1].amount ? (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              ) : (
                                <Activity className="h-5 w-5 text-gray-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.resources.totalCourses}</div>
                  <div className="text-sm text-muted-foreground">
                    {analytics.resources.activeCourses} active
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.resources.totalAssessments}</div>
                  <div className="text-sm text-muted-foreground">
                    {analytics.resources.completedAssessments} completed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Class Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.resources.avgClassSize}</div>
                  <div className="text-sm text-muted-foreground">students per course</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.instructors.activeInstructors}</div>
                  <div className="text-sm text-muted-foreground">
                    {analytics.instructors.avgCoursesPerInstructor.toFixed(1)} courses avg
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>Current utilization rates of key resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.resources.resourceUtilization.map((resource, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{resource.resource}</span>
                          <span className="text-sm font-bold">{resource.utilizationRate}%</span>
                        </div>
                        <Progress value={resource.utilizationRate} className="h-3" />
                        <div className="text-xs text-muted-foreground">
                          {resource.utilizationRate >= 80 ? (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              High utilization
                            </span>
                          ) : resource.utilizationRate >= 60 ? (
                            <span className="text-yellow-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Moderate utilization
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Low utilization
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facility Occupancy</CardTitle>
                  <CardDescription>Space utilization across campus facilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.resources.facilityOccupancy.map((facility, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{facility.facility}</span>
                          <span className="text-sm font-bold">{facility.occupancyRate}%</span>
                        </div>
                        <Progress value={facility.occupancyRate} className="h-3" />
                        <div className="text-xs text-muted-foreground">
                          {facility.occupancyRate >= 85 ? (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Near capacity
                            </span>
                          ) : facility.occupancyRate >= 70 ? (
                            <span className="text-yellow-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Well utilized
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Available space
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Instructor Effectiveness</CardTitle>
                <CardDescription>Performance metrics for teaching staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.instructors.instructorEffectiveness.slice(0, 9).map((instructor, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="font-medium text-sm truncate" title={instructor.instructor}>
                        {instructor.instructor}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Avg Grade</span>
                          <span className="font-bold">{instructor.avgGrade.toFixed(1)}%</span>
                        </div>
                        <Progress value={instructor.avgGrade} className="h-2" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{instructor.studentCount} students</span>
                        <span>{instructor.courseCount} courses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
