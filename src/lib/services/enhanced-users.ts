import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/lib/supabase'

// =============================================
// ENHANCED USER TYPES
// =============================================

export interface UserRoleDefinition {
  id: string
  role_name: string
  role_code: string
  display_name: string
  description?: string
  hierarchy_level: number
  is_system_role: boolean
  is_active: boolean
}

export interface Permission {
  id: string
  permission_name: string
  permission_code: string
  description?: string
  category_name: string
  resource_type?: string
  action_type?: string
  is_system_permission: boolean
}

export interface UserPermissions {
  role_permissions: Permission[]
  individual_permissions: Permission[]
  all_permissions: Permission[]
}

export interface UserProfile {
  id: string
  user_id: string
  employee_id?: string
  national_id?: string
  passport_number?: string
  date_of_birth?: string
  gender?: string
  nationality?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  qualification_level?: string
  specializations?: string[]
  certifications?: any
  languages_spoken?: string[]
  profile_photo_url?: string
  bio?: string
  linkedin_profile?: string
  other_social_links?: any
  custom_fields?: any
}

export interface EnhancedUserWithDetails extends User {
  profile?: UserProfile
  role_definition?: UserRoleDefinition
  department_assignments?: DepartmentAssignment[]
  permissions?: UserPermissions
  department_name?: string
  assigned_courses?: number
  active_students?: number
}

export interface DepartmentAssignment {
  id: string
  department_id: string
  department_name: string
  department_code: string
  assignment_type: 'primary' | 'secondary' | 'temporary'
  position_title?: string
  responsibilities?: string[]
  start_date: string
  end_date?: string
  is_active: boolean
}

export interface ProfileField {
  id: string
  field_name: string
  field_code: string
  display_name: string
  field_type: string
  validation_rules?: any
  is_required: boolean
  is_visible: boolean
  display_order: number
  help_text?: string
}

export interface CreateEnhancedUserData {
  email: string
  full_name: string
  role: string
  department_assignments?: {
    department_id: string
    assignment_type: 'primary' | 'secondary' | 'temporary'
    position_title?: string
    responsibilities?: string[]
  }[]
  profile?: Partial<UserProfile>
  phone?: string
  is_active?: boolean
}

export interface UpdateEnhancedUserData {
  full_name?: string
  role?: string
  phone?: string
  is_active?: boolean
  profile?: Partial<UserProfile>
  department_assignments?: {
    department_id: string
    assignment_type: 'primary' | 'secondary' | 'temporary'
    position_title?: string
    responsibilities?: string[]
  }[]
}

// =============================================
// ENHANCED USER SERVICE
// =============================================

export class EnhancedUserService {

  // =============================================
  // ROLE MANAGEMENT
  // =============================================

  /**
   * Get all available role definitions
   */
  static async getRoleDefinitions(): Promise<UserRoleDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('user_role_definitions')
        .select('*')
        .eq('is_active', true)
        .order('hierarchy_level', { ascending: false })

      if (error) throw new Error(`Failed to fetch role definitions: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching role definitions:', error)
      throw new Error(`Failed to fetch role definitions: ${error.message}`)
    }
  }

  /**
   * Get role definition by code
   */
  static async getRoleDefinitionByCode(roleCode: string): Promise<UserRoleDefinition | null> {
    try {
      const { data, error } = await supabase
        .from('user_role_definitions')
        .select('*')
        .eq('role_code', roleCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`Failed to fetch role definition: ${error.message}`)
      }
      return data
    } catch (error: any) {
      console.error('Error fetching role definition:', error)
      return null
    }
  }

  // =============================================
  // PERMISSION MANAGEMENT
  // =============================================

  /**
   * Get all permissions by category
   */
  static async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select(`
          *,
          permission_categories!inner (
            category_name,
            display_order
          )
        `)
        .eq('is_active', true)
        .order('permission_categories.display_order')

      if (error) throw new Error(`Failed to fetch permissions: ${error.message}`)

      return (data || []).map(permission => ({
        ...permission,
        category_name: permission.permission_categories.category_name
      }))
    } catch (error: any) {
      console.error('Error fetching permissions:', error)
      throw new Error(`Failed to fetch permissions: ${error.message}`)
    }
  }

  /**
   * Get user permissions (role + individual overrides)
   */
  static async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      // Get user's role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userError) throw new Error(`Failed to fetch user: ${userError.message}`)

      // Get role permissions
      const { data: rolePermissions, error: roleError } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions!inner (
            id,
            permission_name,
            permission_code,
            description,
            resource_type,
            action_type,
            is_system_permission,
            permission_categories!inner (category_name)
          ),
          user_role_definitions!inner (role_code)
        `)
        .eq('user_role_definitions.role_code', userData.role.toUpperCase())

      if (roleError) throw new Error(`Failed to fetch role permissions: ${roleError.message}`)

      // Get individual permission overrides
      const { data: individualPermissions, error: individualError } = await supabase
        .from('user_permission_overrides')
        .select(`
          is_granted,
          permissions!inner (
            id,
            permission_name,
            permission_code,
            description,
            resource_type,
            action_type,
            is_system_permission,
            permission_categories!inner (category_name)
          )
        `)
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gt.now()')

      if (individualError) throw new Error(`Failed to fetch individual permissions: ${individualError.message}`)

      // Process permissions
      const rolePerms = (rolePermissions || []).map(rp => ({
        ...rp.permissions,
        category_name: rp.permissions.permission_categories.category_name
      }))

      const individualPerms = (individualPermissions || [])
        .filter(ip => ip.is_granted)
        .map(ip => ({
          ...ip.permissions,
          category_name: ip.permissions.permission_categories.category_name
        }))

      const revokedPerms = (individualPermissions || [])
        .filter(ip => !ip.is_granted)
        .map(ip => ip.permissions.permission_code)

      // Combine permissions (individual overrides take precedence)
      const allPermissions = [
        ...rolePerms.filter(rp => !revokedPerms.includes(rp.permission_code)),
        ...individualPerms
      ]

      // Remove duplicates
      const uniquePermissions = allPermissions.filter((permission, index, self) =>
        index === self.findIndex(p => p.permission_code === permission.permission_code)
      )

      return {
        role_permissions: rolePerms,
        individual_permissions: individualPerms,
        all_permissions: uniquePermissions
      }
    } catch (error: any) {
      console.error('Error fetching user permissions:', error)
      return {
        role_permissions: [],
        individual_permissions: [],
        all_permissions: []
      }
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId)
      return permissions.all_permissions.some(p => p.permission_code === permissionCode)
    } catch (error: any) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  // =============================================
  // PROFILE FIELD MANAGEMENT
  // =============================================

  /**
   * Get profile fields for a specific role
   */
  static async getProfileFieldsForRole(roleCode: string): Promise<ProfileField[]> {
    try {
      const { data, error } = await supabase
        .from('user_profile_fields')
        .select(`
          *,
          role_field_requirements!left (
            is_required,
            is_visible,
            custom_validation
          )
        `)
        .eq('is_visible', true)
        .order('display_order')

      if (error) throw new Error(`Failed to fetch profile fields: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching profile fields:', error)
      throw new Error(`Failed to fetch profile fields: ${error.message}`)
    }
  }

  // =============================================
  // ENHANCED USER CRUD OPERATIONS
  // =============================================

  /**
   * Get all users with enhanced details
   */
  static async getAllEnhancedUsers(filters?: {
    role?: string
    department?: string
    is_active?: boolean
    search?: string
  }): Promise<EnhancedUserWithDetails[]> {
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          user_profiles!left (*),
          user_role_definitions!left (*)
        `)

      // Apply filters
      if (filters?.role) {
        query = query.eq('role', filters.role)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      query = query.order('full_name')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch enhanced users: ${error.message}`)

      // Enhance with department assignments and permissions
      const enhancedUsers = await Promise.all(
        (data || []).map(async (user) => {
          const [departmentAssignments, permissions, stats] = await Promise.all([
            this.getUserDepartmentAssignments(user.id),
            this.getUserPermissions(user.id),
            this.getUserStatistics(user.id)
          ])

          const primaryDepartment = departmentAssignments.find(da => da.assignment_type === 'primary')

          return {
            ...user,
            profile: user.user_profiles?.[0] || null,
            role_definition: user.user_role_definitions?.[0] || null,
            department_assignments: departmentAssignments,
            permissions,
            department_name: primaryDepartment?.department_name,
            ...stats
          } as EnhancedUserWithDetails
        })
      )

      return enhancedUsers
    } catch (error: any) {
      console.error('Error fetching enhanced users:', error)
      throw new Error(`Failed to fetch enhanced users: ${error.message}`)
    }
  }

  /**
   * Get enhanced user by ID
   */
  static async getEnhancedUserById(id: string): Promise<EnhancedUserWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles!left (*),
          user_role_definitions!left (*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`Failed to fetch enhanced user: ${error.message}`)
      }

      const [departmentAssignments, permissions, stats] = await Promise.all([
        this.getUserDepartmentAssignments(id),
        this.getUserPermissions(id),
        this.getUserStatistics(id)
      ])

      const primaryDepartment = departmentAssignments.find(da => da.assignment_type === 'primary')

      return {
        ...data,
        profile: data.user_profiles?.[0] || null,
        role_definition: data.user_role_definitions?.[0] || null,
        department_assignments: departmentAssignments,
        permissions,
        department_name: primaryDepartment?.department_name,
        ...stats
      } as EnhancedUserWithDetails
    } catch (error: any) {
      console.error('Error fetching enhanced user:', error)
      throw new Error(`Failed to fetch enhanced user: ${error.message}`)
    }
  }

  /**
   * Create enhanced user with profile and department assignments
   */
  static async createEnhancedUser(userData: CreateEnhancedUserData): Promise<EnhancedUserWithDetails> {
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single()

      if (existing) {
        throw new Error('Email already exists')
      }

      // Validate role exists
      const roleDefinition = await this.getRoleDefinitionByCode(userData.role)
      if (!roleDefinition) {
        throw new Error('Invalid role specified')
      }

      // Create user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role.toLowerCase(),
          phone: userData.phone,
          is_active: userData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (userError) throw new Error(`Failed to create user: ${userError.message}`)

      // Update profile if provided
      if (userData.profile) {
        await this.updateUserProfile(newUser.id, userData.profile)
      }

      // Create department assignments if provided
      if (userData.department_assignments) {
        await this.updateUserDepartmentAssignments(newUser.id, userData.department_assignments)
      }

      // Return enhanced user
      const enhancedUser = await this.getEnhancedUserById(newUser.id)
      if (!enhancedUser) throw new Error('Failed to retrieve created user')

      console.log('Enhanced user created successfully:', enhancedUser.full_name)
      return enhancedUser
    } catch (error: any) {
      console.error('Error creating enhanced user:', error)
      throw new Error(`Failed to create enhanced user: ${error.message}`)
    }
  }

  /**
   * Update enhanced user
   */
  static async updateEnhancedUser(id: string, updates: UpdateEnhancedUserData): Promise<EnhancedUserWithDetails> {
    try {
      // Update user record
      const userUpdates: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.full_name) userUpdates.full_name = updates.full_name
      if (updates.role) {
        // Validate role exists
        const roleDefinition = await this.getRoleDefinitionByCode(updates.role)
        if (!roleDefinition) {
          throw new Error('Invalid role specified')
        }
        userUpdates.role = updates.role.toLowerCase()
      }
      if (updates.phone) userUpdates.phone = updates.phone
      if (updates.is_active !== undefined) userUpdates.is_active = updates.is_active

      const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', id)
        .select()
        .single()

      if (userError) throw new Error(`Failed to update user: ${userError.message}`)

      // Update profile if provided
      if (updates.profile) {
        await this.updateUserProfile(id, updates.profile)
      }

      // Update department assignments if provided
      if (updates.department_assignments) {
        await this.updateUserDepartmentAssignments(id, updates.department_assignments)
      }

      // Return enhanced user
      const enhancedUser = await this.getEnhancedUserById(id)
      if (!enhancedUser) throw new Error('Failed to retrieve updated user')

      console.log('Enhanced user updated successfully:', enhancedUser.full_name)
      return enhancedUser
    } catch (error: any) {
      console.error('Error updating enhanced user:', error)
      throw new Error(`Failed to update enhanced user: ${error.message}`)
    }
  }

  // =============================================
  // DEPARTMENT ASSIGNMENT MANAGEMENT
  // =============================================

  /**
   * Get user department assignments
   */
  static async getUserDepartmentAssignments(userId: string): Promise<DepartmentAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('user_department_assignments')
        .select(`
          *,
          departments!inner (
            id,
            name,
            code
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('assignment_type')

      if (error) throw new Error(`Failed to fetch department assignments: ${error.message}`)

      return (data || []).map(assignment => ({
        id: assignment.id,
        department_id: assignment.department_id,
        department_name: assignment.departments.name,
        department_code: assignment.departments.code,
        assignment_type: assignment.assignment_type,
        position_title: assignment.position_title,
        responsibilities: assignment.responsibilities,
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        is_active: assignment.is_active
      }))
    } catch (error: any) {
      console.error('Error fetching department assignments:', error)
      return []
    }
  }

  /**
   * Update user department assignments
   */
  static async updateUserDepartmentAssignments(
    userId: string,
    assignments: {
      department_id: string
      assignment_type: 'primary' | 'secondary' | 'temporary'
      position_title?: string
      responsibilities?: string[]
    }[]
  ): Promise<void> {
    try {
      // Remove existing assignments
      await supabase
        .from('user_department_assignments')
        .delete()
        .eq('user_id', userId)

      // Add new assignments
      if (assignments.length > 0) {
        const { error } = await supabase
          .from('user_department_assignments')
          .insert(
            assignments.map(assignment => ({
              user_id: userId,
              department_id: assignment.department_id,
              assignment_type: assignment.assignment_type,
              position_title: assignment.position_title,
              responsibilities: assignment.responsibilities,
              start_date: new Date().toISOString().split('T')[0],
              is_active: true,
              created_at: new Date().toISOString()
            }))
          )

        if (error) throw new Error(`Failed to create department assignments: ${error.message}`)
      }
    } catch (error: any) {
      console.error('Error updating department assignments:', error)
      throw new Error(`Failed to update department assignments: ${error.message}`)
    }
  }

  // =============================================
  // PROFILE MANAGEMENT
  // =============================================

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileUpdates,
          updated_at: new Date().toISOString()
        })

      if (error) throw new Error(`Failed to update user profile: ${error.message}`)
    } catch (error: any) {
      console.error('Error updating user profile:', error)
      throw new Error(`Failed to update user profile: ${error.message}`)
    }
  }

  // =============================================
  // STATISTICS AND ANALYTICS
  // =============================================

  /**
   * Get user statistics
   */
  static async getUserStatistics(userId: string) {
    try {
      const [coursesResult, studentsResult] = await Promise.all([
        // Count assigned courses
        supabase
          .from('course_instructors')
          .select('id', { count: 'exact' })
          .eq('instructor_id', userId),

        // Count active students in assigned courses
        supabase
          .from('student_enrollments')
          .select(`
            id,
            course_id,
            course_instructors!inner (instructor_id)
          `, { count: 'exact' })
          .eq('course_instructors.instructor_id', userId)
          .eq('status', 'enrolled')
      ])

      return {
        assigned_courses: coursesResult.count || 0,
        active_students: studentsResult.count || 0
      }
    } catch (error: any) {
      console.error('Error fetching user statistics:', error)
      return {
        assigned_courses: 0,
        active_students: 0
      }
    }
  }

  /**
   * Get enhanced role statistics
   */
  static async getEnhancedRoleStatistics() {
    try {
      // Get role definitions
      const roleDefinitions = await this.getRoleDefinitions()

      // Get user counts by role
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, is_active')

      if (error) throw new Error(`Failed to fetch role statistics: ${error.message}`)

      const stats: Record<string, { total: number; active: number; inactive: number }> = {}

      // Initialize stats for all role definitions
      roleDefinitions.forEach(role => {
        stats[role.role_code] = { total: 0, active: 0, inactive: 0 }
      })

      // Count users by role
      userData?.forEach(user => {
        const roleCode = user.role.toUpperCase()
        if (stats[roleCode]) {
          stats[roleCode].total++
          if (user.is_active) {
            stats[roleCode].active++
          } else {
            stats[roleCode].inactive++
          }
        }
      })

      return {
        roleDefinitions,
        statistics: stats,
        total: userData?.length || 0,
        active: userData?.filter(u => u.is_active).length || 0,
        inactive: userData?.filter(u => !u.is_active).length || 0
      }
    } catch (error: any) {
      console.error('Error fetching enhanced role statistics:', error)
      return {
        roleDefinitions: [],
        statistics: {},
        total: 0,
        active: 0,
        inactive: 0
      }
    }
  }

  // =============================================
  // VALIDATION UTILITIES
  // =============================================

  /**
   * Validate user data against role requirements
   */
  static async validateUserData(userData: any, roleCode: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const errors: string[] = []
      const profileFields = await this.getProfileFieldsForRole(roleCode)

      for (const field of profileFields) {
        const value = userData[field.field_name]

        // Check required fields
        if (field.is_required && (!value || value === '')) {
          errors.push(`${field.display_name} is required`)
          continue
        }

        // Apply validation rules
        if (value && field.validation_rules) {
          const rules = field.validation_rules

          // String length validation
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field.display_name} must be at least ${rules.minLength} characters`)
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field.display_name} must not exceed ${rules.maxLength} characters`)
          }

          // Pattern validation
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            errors.push(`${field.display_name} format is invalid`)
          }

          // Email validation
          if (field.field_type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${field.display_name} must be a valid email address`)
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error: any) {
      console.error('Error validating user data:', error)
      return {
        isValid: false,
        errors: ['Validation error occurred']
      }
    }
  }
}
