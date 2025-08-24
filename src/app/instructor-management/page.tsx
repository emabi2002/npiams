'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  UserCheck,
  Users,
  Calendar,
  Clock,
  Plus,
  Search,
  BookOpen,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye
} from 'lucide-react'

export default function InstructorManagementPage() {
  const [selectedTerm, setSelectedTerm] = useState('term1_2025')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Management</h1>
          <p className="text-muted-foreground">
            Manage instructor allocations, timetables, and attendance tracking
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term1_2025">Term 1 - 2025</SelectItem>
              <SelectItem value="term2_2025">Term 2 - 2025</SelectItem>
              <SelectItem value="term3_2025">Term 3 - 2025</SelectItem>
              <SelectItem value="term4_2025">Term 4 - 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Instructors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 from last term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Allocations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground">
              Across 15 courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Contact Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,024</div>
            <p className="text-xs text-muted-foreground">
              Total across all instructors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.2%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last term
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allocation">Course Allocation</TabsTrigger>
          <TabsTrigger value="timetables">Class Timetables</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Instructor Course Allocation</CardTitle>
                  <CardDescription>
                    Assign instructors to courses and manage teaching loads
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Allocation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Course Allocation</DialogTitle>
                      <DialogDescription>
                        Assign an instructor to a course for this term
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="instructor">Instructor</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select instructor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="john_smith">Dr. John Smith</SelectItem>
                            <SelectItem value="mary_jones">Prof. Mary Jones</SelectItem>
                            <SelectItem value="peter_kila">Mr. Peter Kila</SelectItem>
                            <SelectItem value="sarah_namaliu">Ms. Sarah Namaliu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="course">Course</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eng101">ENG101 - Engineering Mathematics</SelectItem>
                            <SelectItem value="cs201">CS201 - Computer Programming</SelectItem>
                            <SelectItem value="bus301">BUS301 - Business Administration</SelectItem>
                            <SelectItem value="elec401">ELEC401 - Electrical Systems</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="hours">Weekly Contact Hours</Label>
                        <Input
                          id="hours"
                          type="number"
                          placeholder="e.g., 6"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Teaching Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary Instructor</SelectItem>
                            <SelectItem value="assistant">Assistant Instructor</SelectItem>
                            <SelectItem value="guest">Guest Lecturer</SelectItem>
                            <SelectItem value="practical">Practical Supervisor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional notes about this allocation..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button type="submit">Create Allocation</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search instructors or courses..."
                  className="max-w-sm"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="computing">Computing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact Hours</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Dr. John Smith</p>
                        <p className="text-sm text-muted-foreground">Senior Lecturer</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Engineering Mathematics I</p>
                        <p className="text-sm text-muted-foreground">ENG101</p>
                      </div>
                    </TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>6 hours/week</TableCell>
                    <TableCell>
                      <Badge variant="default">Primary</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Prof. Mary Jones</p>
                        <p className="text-sm text-muted-foreground">Head of Department</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Computer Programming</p>
                        <p className="text-sm text-muted-foreground">CS201</p>
                      </div>
                    </TableCell>
                    <TableCell>Computing</TableCell>
                    <TableCell>8 hours/week</TableCell>
                    <TableCell>
                      <Badge variant="default">Primary</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Mr. Peter Kila</p>
                        <p className="text-sm text-muted-foreground">Lecturer</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Business Administration</p>
                        <p className="text-sm text-muted-foreground">BUS301</p>
                      </div>
                    </TableCell>
                    <TableCell>Business</TableCell>
                    <TableCell>5 hours/week</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Assistant</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetables" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Class Timetables</CardTitle>
                  <CardDescription>
                    Manage and view instructor class schedules
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all_instructors">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_instructors">All Instructors</SelectItem>
                      <SelectItem value="john_smith">Dr. John Smith</SelectItem>
                      <SelectItem value="mary_jones">Prof. Mary Jones</SelectItem>
                      <SelectItem value="peter_kila">Mr. Peter Kila</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Timetable
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Weekly Timetable Grid */}
                <div className="grid grid-cols-6 gap-4">
                  <div className="font-medium text-center py-2">Time</div>
                  <div className="font-medium text-center py-2">Monday</div>
                  <div className="font-medium text-center py-2">Tuesday</div>
                  <div className="font-medium text-center py-2">Wednesday</div>
                  <div className="font-medium text-center py-2">Thursday</div>
                  <div className="font-medium text-center py-2">Friday</div>

                  <div className="text-sm text-center py-2 border-r">8:00 - 9:00</div>
                  <div className="p-2 border rounded bg-blue-50">
                    <div className="text-xs font-medium">ENG101</div>
                    <div className="text-xs text-muted-foreground">Dr. Smith</div>
                    <div className="text-xs text-muted-foreground">Room A1</div>
                  </div>
                  <div className="p-2 border rounded"></div>
                  <div className="p-2 border rounded bg-green-50">
                    <div className="text-xs font-medium">CS201</div>
                    <div className="text-xs text-muted-foreground">Prof. Jones</div>
                    <div className="text-xs text-muted-foreground">Lab B</div>
                  </div>
                  <div className="p-2 border rounded"></div>
                  <div className="p-2 border rounded bg-orange-50">
                    <div className="text-xs font-medium">BUS301</div>
                    <div className="text-xs text-muted-foreground">Mr. Kila</div>
                    <div className="text-xs text-muted-foreground">Room C2</div>
                  </div>

                  <div className="text-sm text-center py-2 border-r">9:00 - 10:00</div>
                  <div className="p-2 border rounded bg-blue-50">
                    <div className="text-xs font-medium">ENG101</div>
                    <div className="text-xs text-muted-foreground">Dr. Smith</div>
                    <div className="text-xs text-muted-foreground">Room A1</div>
                  </div>
                  <div className="p-2 border rounded bg-purple-50">
                    <div className="text-xs font-medium">ELEC401</div>
                    <div className="text-xs text-muted-foreground">Ms. Namaliu</div>
                    <div className="text-xs text-muted-foreground">Lab C</div>
                  </div>
                  <div className="p-2 border rounded bg-green-50">
                    <div className="text-xs font-medium">CS201</div>
                    <div className="text-xs text-muted-foreground">Prof. Jones</div>
                    <div className="text-xs text-muted-foreground">Lab B</div>
                  </div>
                  <div className="p-2 border rounded"></div>
                  <div className="p-2 border rounded bg-orange-50">
                    <div className="text-xs font-medium">BUS301</div>
                    <div className="text-xs text-muted-foreground">Mr. Kila</div>
                    <div className="text-xs text-muted-foreground">Room C2</div>
                  </div>

                  <div className="text-sm text-center py-2 border-r">10:30 - 11:30</div>
                  <div className="p-2 border rounded"></div>
                  <div className="p-2 border rounded bg-purple-50">
                    <div className="text-xs font-medium">ELEC401</div>
                    <div className="text-xs text-muted-foreground">Ms. Namaliu</div>
                    <div className="text-xs text-muted-foreground">Lab C</div>
                  </div>
                  <div className="p-2 border rounded"></div>
                  <div className="p-2 border rounded bg-blue-50">
                    <div className="text-xs font-medium">ENG101</div>
                    <div className="text-xs text-muted-foreground">Dr. Smith</div>
                    <div className="text-xs text-muted-foreground">Room A1</div>
                  </div>
                  <div className="p-2 border rounded bg-green-50">
                    <div className="text-xs font-medium">CS201</div>
                    <div className="text-xs text-muted-foreground">Prof. Jones</div>
                    <div className="text-xs text-muted-foreground">Lab B</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Instructor Attendance Tracking</CardTitle>
                  <CardDescription>
                    Monitor instructor attendance and class delivery
                  </CardDescription>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search instructors..."
                  className="max-w-sm"
                />
                <Select defaultValue="this_week">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_term">This Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Scheduled Classes</TableHead>
                    <TableHead>Classes Delivered</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Last Absence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Dr. John Smith</p>
                        <p className="text-sm text-muted-foreground">Engineering Dept.</p>
                      </div>
                    </TableCell>
                    <TableCell>16</TableCell>
                    <TableCell>16</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-green-600 font-medium">100%</div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">Never</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Excellent</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Prof. Mary Jones</p>
                        <p className="text-sm text-muted-foreground">Computing Dept.</p>
                      </div>
                    </TableCell>
                    <TableCell>20</TableCell>
                    <TableCell>19</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-green-600 font-medium">95%</div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell>2025-01-10</TableCell>
                    <TableCell>
                      <Badge variant="default">Good</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Mr. Peter Kila</p>
                        <p className="text-sm text-muted-foreground">Business Dept.</p>
                      </div>
                    </TableCell>
                    <TableCell>15</TableCell>
                    <TableCell>13</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-orange-600 font-medium">87%</div>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      </div>
                    </TableCell>
                    <TableCell>2025-01-12</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Needs Attention</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
