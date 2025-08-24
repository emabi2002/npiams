'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Key,
  UserPlus,
  Filter,
  Download,
  Upload
} from 'lucide-react'

import {
  EnhancedUserService,
  type EnhancedUserWithDetails,
  type UserRoleDefinition,
  type Permission,
  type CreateEnhancedUserData,
  type UpdateEnhancedUserData,
  type ProfileField
} from '@/lib/services/enhanced-users'
import { DepartmentService, type DepartmentWithDetails } from '@/lib/services/departments'

export default function EnhancedUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<EnhancedUserWithDetails[]>([])
  const [departments, setDepartments] = useState<DepartmentWithDetails[]>([])
  const [roleDefinitions, setRoleDefinitions] = useState<UserRoleDefinition[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [profileFields, setProfileFields] = useState<ProfileField[]>([])

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<EnhancedUserWithDetails | null>(null)
  const [viewingPermissionsUser, setViewingPermissionsUser] = useState<EnhancedUserWithDetails | null>(null)

  // Form state for create
  const [formData, setFormData] = useState<CreateEnhancedUserData>({
    email: '',
    full_name: '',
    role: 'student',
    phone: '',
    department_assignments: [],
    profile: {}
  })

  // Form state for edit
  const [editFormData, setEditFormData] = useState<UpdateEnhancedUserData>({
    full_name: '',
    role: 'student',
    phone: '',
    department_assignments: [],
    profile: {}
  })

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    roleStats: {} as Record<string, { total: number; active: number; inactive: number }>
  })

  // UI state
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [users, roleDefinitions])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [usersData, departmentsData, rolesData, permissionsData] = await Promise.all([
        EnhancedUserService.getAllEnhancedUsers(),
        DepartmentService.getAllDepartments(),
        EnhancedUserService.getRoleDefinitions(),
        EnhancedUserService.getAllPermissions()
      ])

      setUsers(usersData)
      setDepartments(departmentsData)
      setRoleDefinitions(rolesData)
      setPermissions(permissionsData)
    } catch (error: any) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfileFields = async (roleCode: string) => {
    try {
      const fields = await EnhancedUserService.getProfileFieldsForRole(roleCode)
      setProfileFields(fields)
    } catch (error: any) {
      console.error('Error loading profile fields:', error)
    }
  }

  const calculateStats = () => {
    const total = users.length
    const active = users.filter(u => u.is_active).length
    const inactive = total - active

    const roleStats: Record<string, { total: number; active: number; inactive: number }> = {}

    roleDefinitions.forEach(role => {
      const roleUsers = users.filter(u => u.role === role.role_code.toLowerCase())
      roleStats[role.role_code] = {
        total: roleUsers.length,
        active: roleUsers.filter(u => u.is_active).length,
        inactive: roleUsers.filter(u => !u.is_active).length
      }
    })

    setStats({
      total,
      active,
      inactive,
      roleStats
    })
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.full_name || !formData.role) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)

      // Validate data
      const validation = await EnhancedUserService.validateUserData(formData, formData.role)
      if (!validation.isValid) {
        alert(`Validation failed:\n${validation.errors.join('\n')}`)
        return
      }

      await EnhancedUserService.createEnhancedUser(formData)

      // Reset form and close dialog
      setFormData({
        email: '',
        full_name: '',
        role: 'student',
        phone: '',
        department_assignments: [],
        profile: {}
      })
      setIsCreateDialogOpen(false)

      // Reload users
      await loadInitialData()

      alert('User created successfully!')
    } catch (error: any) {
      console.error('Error creating user:', error)
      alert(`Failed to create user: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async (userToEdit: EnhancedUserWithDetails) => {
    setEditingUser(userToEdit)
    setEditFormData({
      full_name: userToEdit.full_name,
      role: userToEdit.role,
      phone: userToEdit.phone || '',
      department_assignments: userToEdit.department_assignments?.map(da => ({
        department_id: da.department_id,
        assignment_type: da.assignment_type,
        position_title: da.position_title,
        responsibilities: da.responsibilities
      })) || [],
      profile: userToEdit.profile || {}
    })

    // Load profile fields for the user's role
    await loadProfileFields(userToEdit.role.toUpperCase())
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (!editFormData.full_name || !editFormData.role) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)

      // Validate data
      const validation = await EnhancedUserService.validateUserData(editFormData, editFormData.role!)
      if (!validation.isValid) {
        alert(`Validation failed:\n${validation.errors.join('\n')}`)
        return
      }

      await EnhancedUserService.updateEnhancedUser(editingUser.id, editFormData)

      // Reset form and close dialog
      setEditFormData({
        full_name: '',
        role: 'student',
        phone: '',
        department_assignments: [],
        profile: {}
      })
      setEditingUser(null)
      setIsEditDialogOpen(false)

      // Reload users
      await loadInitialData()

      alert('User updated successfully!')
    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(`Failed to update user: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewPermissions = (user: EnhancedUserWithDetails) => {
    setViewingPermissionsUser(user)
    setIsPermissionsDialogOpen(true)
  }

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department_name && user.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesDepartment = departmentFilter === 'all' ||
      user.department_assignments?.some(da => da.department_id === departmentFilter)
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus
  })

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category_name]) {
      acc[permission.category_name] = []
    }
    acc[permission.category_name].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading enhanced user management...</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user can manage users
  const canManageUsers = user?.role === 'admin'

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Enhanced User Management
          </h1>
          <p className="text-gray-600 mt-2">Dynamic role-based user management with comprehensive profiles</p>
        </div>
        {canManageUsers && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Users
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Users
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user with dynamic role assignment and comprehensive profile
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="role">Role & Permissions</TabsTrigger>
                      <TabsTrigger value="profile">Profile Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email address"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="employee_id">Employee ID</Label>
                          <Input
                            id="employee_id"
                            value={formData.profile?.employee_id || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              profile: { ...prev.profile, employee_id: e.target.value }
                            }))}
                            placeholder="Auto-generated if empty"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="role" className="space-y-4">
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, role: value }))
                            loadProfileFields(value.toUpperCase())
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleDefinitions.map((role) => (
                              <SelectItem key={role.id} value={role.role_code.toLowerCase()}>
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{role.display_name}</div>
                                    <div className="text-xs text-muted-foreground">{role.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Department Assignments</Label>
                        <div className="space-y-2 mt-2">
                          {departments.map((dept) => (
                            <div key={dept.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`dept-${dept.id}`}
                                checked={formData.department_assignments?.some(da => da.department_id === dept.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      department_assignments: [
                                        ...(prev.department_assignments || []),
                                        {
                                          department_id: dept.id,
                                          assignment_type: 'primary' as const,
                                          position_title: '',
                                          responsibilities: []
                                        }
                                      ]
                                    }))
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      department_assignments: prev.department_assignments?.filter(
                                        da => da.department_id !== dept.id
                                      ) || []
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={`dept-${dept.id}`} className="text-sm">
                                {dept.name} ({dept.code})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.profile?.date_of_birth || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              profile: { ...prev.profile, date_of_birth: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.profile?.gender || ''}
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              profile: { ...prev.profile, gender: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea
                          id="bio"
                          value={formData.profile?.bio || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, bio: e.target.value }
                          }))}
                          placeholder="Brief biography or description"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="qualification_level">Qualification Level</Label>
                          <Input
                            id="qualification_level"
                            value={formData.profile?.qualification_level || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              profile: { ...prev.profile, qualification_level: e.target.value }
                            }))}
                            placeholder="e.g., Bachelor's Degree"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nationality">Nationality</Label>
                          <Input
                            id="nationality"
                            value={formData.profile?.nationality || 'Papua New Guinean'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              profile: { ...prev.profile, nationality: e.target.value }
                            }))}
                            placeholder="Nationality"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        {roleDefinitions.slice(0, 4).map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{role.display_name}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.roleStats[role.role_code]?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.roleStats[role.role_code]?.active || 0} active
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <CardDescription>
            Filter users by multiple criteria for precise management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleDefinitions.map((role) => (
                  <SelectItem key={role.id} value={role.role_code.toLowerCase()}>
                    {role.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Comprehensive user management with role-based permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role & Permissions</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Statistics</TableHead>
                  {canManageUsers && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageUsers ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all'
                        ? 'No users found matching your criteria.'
                        : 'No users found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <>
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserExpansion(user.id)}
                          >
                            {expandedUsers.has(user.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              {user.full_name}
                              {user.profile?.employee_id && (
                                <Badge variant="outline" className="text-xs">
                                  {user.profile.employee_id}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className={
                                user.role === 'admin' ? 'border-red-200 text-red-800 bg-red-50' :
                                user.role === 'department_head' ? 'border-blue-200 text-blue-800 bg-blue-50' :
                                user.role === 'instructor' ? 'border-purple-200 text-purple-800 bg-purple-50' :
                                user.role === 'tutor' ? 'border-orange-200 text-orange-800 bg-orange-50' :
                                'border-green-200 text-green-800 bg-green-50'
                              }
                            >
                              {user.role_definition?.display_name || user.role.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {user.permissions?.all_permissions.length || 0} permissions
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.department_assignments?.map((assignment, index) => (
                              <Badge
                                key={index}
                                variant={assignment.assignment_type === 'primary' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {assignment.department_name}
                                {assignment.assignment_type !== 'primary' && (
                                  <span className="ml-1 opacity-70">({assignment.assignment_type})</span>
                                )}
                              </Badge>
                            ))}
                            {(!user.department_assignments || user.department_assignments.length === 0) && (
                              <span className="text-muted-foreground text-sm">No department</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.role === 'instructor' || user.role === 'tutor' ? (
                            <div className="text-sm">
                              <div>Courses: {user.assigned_courses || 0}</div>
                              <div>Students: {user.active_students || 0}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        {canManageUsers && (
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPermissions(user)}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                disabled={isSubmitting}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Expanded User Details */}
                      {expandedUsers.has(user.id) && (
                        <TableRow>
                          <TableCell colSpan={canManageUsers ? 7 : 6}>
                            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                              <Tabs defaultValue="profile" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="profile">Profile</TabsTrigger>
                                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                                  <TabsTrigger value="activity">Activity</TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile" className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {user.profile?.date_of_birth && (
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Born {user.profile.date_of_birth}</span>
                                      </div>
                                    )}
                                    {user.profile?.nationality && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{user.profile.nationality}</span>
                                      </div>
                                    )}
                                    {user.profile?.qualification_level && (
                                      <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{user.profile.qualification_level}</span>
                                      </div>
                                    )}
                                  </div>
                                  {user.profile?.bio && (
                                    <div>
                                      <h4 className="font-medium mb-2">Biography</h4>
                                      <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
                                    </div>
                                  )}
                                </TabsContent>

                                <TabsContent value="permissions" className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Role Permissions</h4>
                                      <div className="space-y-1">
                                        {user.permissions?.role_permissions.slice(0, 5).map((permission) => (
                                          <Badge key={permission.id} variant="outline" className="text-xs">
                                            {permission.permission_name}
                                          </Badge>
                                        ))}
                                        {(user.permissions?.role_permissions.length || 0) > 5 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{(user.permissions?.role_permissions.length || 0) - 5} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Individual Permissions</h4>
                                      <div className="space-y-1">
                                        {user.permissions?.individual_permissions.length === 0 ? (
                                          <span className="text-sm text-muted-foreground">None</span>
                                        ) : (
                                          user.permissions?.individual_permissions.map((permission) => (
                                            <Badge key={permission.id} variant="outline" className="text-xs">
                                              {permission.permission_name}
                                            </Badge>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="activity" className="space-y-4">
                                  <div className="text-sm text-muted-foreground">
                                    Activity tracking and audit logs would be displayed here.
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Permissions - {viewingPermissionsUser?.full_name}</DialogTitle>
            <DialogDescription>
              Complete overview of user permissions and access rights
            </DialogDescription>
          </DialogHeader>

          {viewingPermissionsUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-sm">
                      {viewingPermissionsUser.role_definition?.display_name || viewingPermissionsUser.role}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {viewingPermissionsUser.permissions?.all_permissions.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Individual Overrides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {viewingPermissionsUser.permissions?.individual_permissions.length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Permissions by Category</h4>
                {Object.entries(groupedPermissions).map(([categoryName, categoryPermissions]) => {
                  const userPermissions = viewingPermissionsUser.permissions?.all_permissions || []
                  const userHasPermissions = categoryPermissions.filter(p =>
                    userPermissions.some(up => up.permission_code === p.permission_code)
                  )

                  if (userHasPermissions.length === 0) return null

                  return (
                    <Collapsible key={categoryName}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>{categoryName} ({userHasPermissions.length})</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {userHasPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center gap-2 p-2 border rounded">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="font-medium text-sm">{permission.permission_name}</div>
                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
