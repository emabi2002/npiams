'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Search,
  Users,
  GraduationCap,
  Building2,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { CourseService, type CourseWithDetails, type CreateCourseData } from '@/lib/services/courses'
import { DepartmentService, type DepartmentWithDetails } from '@/lib/services/departments'
import { ProgramService, type ProgramWithDetails } from '@/lib/services/programs'

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseWithDetails[]>([])
  const [departments, setDepartments] = useState<DepartmentWithDetails[]>([])
  const [programs, setPrograms] = useState<ProgramWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [semesterFilter, setSemesterFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseWithDetails | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateCourseData>({
    name: '',
    code: '',
    description: '',
    department_id: '',
    program_id: '',
    year_level: 1,
    semester: '1',
    credit_hours: 3
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, departmentsData, programsData] = await Promise.allSettled([
        CourseService.getAllCourses({ is_active: true }),
        DepartmentService.getAllDepartments(),
        ProgramService.getAllPrograms({ is_active: true })
      ])

      setCourses(coursesData.status === 'fulfilled' ? coursesData.value : [])
      setDepartments(departmentsData.status === 'fulfilled' ? departmentsData.value : [])
      setPrograms(programsData.status === 'fulfilled' ? programsData.value : [])

      // If database not connected, use sample data
      if (coursesData.status === 'rejected') {
        const sampleCourses: any[] = [
          {
            id: '1',
            name: 'Engineering Mathematics I',
            code: 'ENG101',
            description: 'Foundation mathematics for engineering students',
            department: { name: 'Engineering Department' },
            program: { name: 'Diploma in Civil Engineering' },
            year_level: 1,
            semester: '1',
            credit_hours: 4,
            total_students: 45,
            total_assessments: 6,
            enrollment_count: 45
          },
          {
            id: '2',
            name: 'Engineering Drawing',
            code: 'ENG102',
            description: 'Technical drawing and CAD fundamentals',
            department: { name: 'Engineering Department' },
            program: { name: 'Diploma in Civil Engineering' },
            year_level: 1,
            semester: '1',
            credit_hours: 3,
            total_students: 45,
            total_assessments: 4,
            enrollment_count: 45
          }
        ]
        setCourses(sampleCourses)
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create or Update Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.code || !formData.department_id || !formData.program_id) {
      alert('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)

      if (editingCourse) {
        // Update existing course
        await CourseService.updateCourse(editingCourse.id, {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          department_id: formData.department_id,
          program_id: formData.program_id,
          year_level: formData.year_level,
          semester: formData.semester,
          credit_hours: formData.credit_hours
        })
        alert('Course updated successfully!')
      } else {
        // Create new course
        await CourseService.createCourse(formData)
        alert('Course created successfully!')
      }

      setFormData({
        name: '',
        code: '',
        description: '',
        department_id: '',
        program_id: '',
        year_level: 1,
        semester: '1',
        credit_hours: 3
      })
      setEditingCourse(null)
      setIsDialogOpen(false)
      await loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Create Course Dialog
  const openCreateDialog = () => {
    setEditingCourse(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      department_id: '',
      program_id: '',
      year_level: 1,
      semester: '1',
      credit_hours: 3
    })
    setIsDialogOpen(true)
  }

  // Edit Course
  const handleEditCourse = (course: CourseWithDetails) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      department_id: course.department_id,
      program_id: course.program_id,
      year_level: course.year_level,
      semester: course.semester,
      credit_hours: course.credit_hours
    })
    setIsDialogOpen(true)
  }

  // Delete Course
  const handleDeleteCourse = async (course: CourseWithDetails) => {
    if (!confirm(`Are you sure you want to delete the course "${course.name}"?`)) {
      return
    }

    try {
      setIsSubmitting(true)
      await CourseService.deleteCourse(course.id)
      alert('Course deleted successfully!')
      await loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || course.department_id === departmentFilter
    const matchesProgram = programFilter === 'all' || course.program_id === programFilter
    const matchesYear = yearFilter === 'all' || course.year_level.toString() === yearFilter
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter

    return matchesSearch && matchesDepartment && matchesProgram && matchesYear && matchesSemester
  })

  // Get programs filtered by selected department
  const filteredPrograms = formData.department_id
    ? programs.filter(p => p.department_id === formData.department_id)
    : programs

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Courses Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage courses organized by departments and programs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
              <DialogDescription>
                {editingCourse ? 'Update the course information' : 'Add a new course to a program'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course_name">Course Name *</Label>
                  <Input
                    id="course_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Engineering Mathematics I"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="course_code">Course Code *</Label>
                  <Input
                    id="course_code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., ENG101"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course_dept">Department *</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, department_id: value, program_id: '' }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course_program">Program *</Label>
                  <Select
                    value={formData.program_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, program_id: value }))}
                    disabled={!formData.department_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="course_year">Year Level *</Label>
                  <Select
                    value={formData.year_level.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, year_level: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course_semester">Semester *</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value as '1' | '2' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course_credits">Credit Hours *</Label>
                  <Input
                    id="course_credits"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credit_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, credit_hours: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="course_desc">Description</Label>
                <Textarea
                  id="course_desc"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the course"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingCourse ? 'Updating...' : 'Creating...') : (editingCourse ? 'Update Course' : 'Create Course')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + (course.total_students || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Courses</CardTitle>
          <CardDescription>Filter courses by department, program, year, and semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>Manage all academic courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Year/Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {courses.length === 0 ? 'No courses created yet.' : 'No courses match your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.name}</div>
                        {course.description && (
                          <div className="text-sm text-muted-foreground">{course.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{course.code}</Badge>
                    </TableCell>
                    <TableCell>{course.department?.name || 'No Department'}</TableCell>
                    <TableCell>{course.program?.name || 'No Program'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Year {course.year_level}</div>
                        <div className="text-muted-foreground">Semester {course.semester}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.credit_hours} Credits</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{course.total_students || 0} Students</div>
                        <div className="text-muted-foreground">{course.total_assessments || 0} Assessments</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                          disabled={isSubmitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
