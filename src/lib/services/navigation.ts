import { supabase } from '@/lib/supabase'

export interface NavigationItem {
  id: string
  menu_key: string
  menu_label: string
  menu_icon?: string
  menu_url?: string
  sort_order: number
  required_role?: string
  is_dropdown: boolean
  is_active: boolean
  children?: NavigationItem[]
  icon?: any
  description?: string
  external?: boolean
}

export interface NavigationGroup {
  title: string
  icon: any
  items: NavigationItem[]
}

export class NavigationService {
  /**
   * Get navigation structure from database
   */
  static async getNavigationStructure(): Promise<NavigationItem[]> {
    try {
      const { data, error } = await supabase
        .from('navigation_config')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error || !data) throw error

      const navigationMap = new Map<string, NavigationItem>()
      const rootItems: NavigationItem[] = []

      // ✅ Normalize each DB row before placing into the map
      data.forEach((item: any) => {
        const normalized = this.normalizeItem(item)
        navigationMap.set(normalized.id, {
          ...normalized,
          children: []
        })
      })

      // Build parent/child relationships after normalization
      data.forEach((item: any) => {
        const id = String(item.id)
        const navItem = navigationMap.get(id)!
        const parentId = item.parent_id ? String(item.parent_id) : undefined

        if (parentId) {
          const parent = navigationMap.get(parentId)
          if (parent) {
            parent.children = parent.children || []
            parent.children.push(navItem)
          }
        } else {
          rootItems.push(navItem)
        }
      })

      return rootItems
    } catch (error: any) {
      console.error('Error fetching navigation structure:', error)
      return this.getDefaultNavigation()
    }
  }

  /**
   * Normalize a raw item (from DB or elsewhere)
   * - Auto-detect external links (http/https)
   * - Ensure internal urls start with '/'
   */
  private static normalizeItem<T extends Partial<NavigationItem> & { id: string }>(item: T): NavigationItem {
    const rawUrl = typeof item.menu_url === 'string' ? item.menu_url.trim() : undefined
    const looksExternal = !!rawUrl && /^https?:\/\//i.test(rawUrl)

    let menu_url: string | undefined
    if (rawUrl) {
      menu_url = looksExternal
        ? rawUrl
        : rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
    }

    return {
      id: String(item.id),
      menu_key: item.menu_key || '',
      menu_label: item.menu_label || '',
      menu_icon: item.menu_icon,
      menu_url,
      sort_order: item.sort_order ?? 0,
      required_role: item.required_role,
      is_dropdown: !!item.is_dropdown,
      is_active: item.is_active !== false,
      children: (item.children as NavigationItem[]) || [],
      icon: item.icon,
      description: item.description,
      // if DB didn’t set external, infer it from the URL pattern
      external: item.external ?? looksExternal,
    }
  }

  /**
   * Filter navigation by user role
   */
  static filterNavigationByRole(navigation: NavigationItem[], userRole?: string): NavigationItem[] {
    return navigation
      .filter(item => {
        if (!item.required_role) return true
        if (!userRole) return false
        if (userRole === 'admin') return true
        return item.required_role === userRole || item.required_role.split(',').includes(userRole)
      })
      .map(item => ({
        ...item,
        children: item.children ? this.filterNavigationByRole(item.children, userRole) : []
      }))
  }

  /**
   * Fallback navigation structure if database is unavailable
   * (kept as you provided; now also normalized)
   */
  private static getDefaultNavigation(): NavigationItem[] {
    const items: NavigationItem[] = [
      {
        id: 'academic_setup',
        menu_key: 'academic_setup',
        menu_label: 'Academic Setup',
        menu_icon: 'Settings',
        sort_order: 1,
        is_dropdown: false,
        is_active: true,
        children: [
          {
            id: 'academic_years',
            menu_key: 'academic_years',
            menu_label: 'Academic Years',
            menu_icon: 'Calendar',
            menu_url: '/academic-calendar',
            sort_order: 1,
            is_dropdown: false,
            is_active: true
          },
          {
            id: 'departments',
            menu_key: 'departments',
            menu_label: 'Departments',
            menu_icon: 'Building2',
            menu_url: '/departments',
            sort_order: 2,
            is_dropdown: false,
            is_active: true
          },
          {
            id: 'programs',
            menu_key: 'programs',
            menu_label: 'Programs',
            menu_icon: 'GraduationCap',
            menu_url: '/programs',
            sort_order: 3,
            is_dropdown: false,
            is_active: true
          },
          {
            id: 'courses',
            menu_key: 'courses',
            menu_label: 'Courses',
            menu_icon: 'BookOpen',
            menu_url: '/courses',
            sort_order: 4,
            is_dropdown: false,
            is_active: true
          }
        ]
      },
      {
        id: 'student_management',
        menu_key: 'student_management',
        menu_label: 'Student Management',
        menu_icon: 'Users',
        sort_order: 2,
        is_dropdown: false,
        is_active: true,
        children: [
          {
            id: 'new_applications',
            menu_key: 'new_applications',
            menu_label: 'New Applications',
            menu_icon: 'UserPlus',
            menu_url: 'https://same-wgoiz1sb4xo-latest.netlify.app/',
            sort_order: 1,
            is_dropdown: false,
            is_active: true,
            external: true
          },
          {
            id: 'student_profiles',
            menu_key: 'student_profiles',
            menu_label: 'Student Profiles',
            menu_icon: 'User',
            menu_url: '/students',
            sort_order: 2,
            is_dropdown: false,
            is_active: true
          },
          {
            id: 'user_management',
            menu_key: 'user_management',
            menu_label: 'User Management',
            menu_icon: 'Users',
            menu_url: '/users',
            sort_order: 3,
            is_dropdown: false,
            is_active: true
          }
        ]
      },
      {
        id: 'fee_management',
        menu_key: 'fee_management',
        menu_label: 'Fee Management',
        menu_icon: 'CreditCard',
        sort_order: 3,
        is_dropdown: false,
        is_active: true,
        children: [
          {
            id: 'fee_management_page',
            menu_key: 'fee_management_page',
            menu_label: 'Fee Management',
            menu_icon: 'CreditCard',
            menu_url: '/fee-management',
            sort_order: 1,
            is_dropdown: false,
            is_active: true
          }
        ]
      },
      {
        id: 'assessment_exams',
        menu_key: 'assessment_exams',
        menu_label: 'Assessment & Exams',
        menu_icon: 'ClipboardList',
        sort_order: 4,
        is_dropdown: false,
        is_active: true,
        children: [
          {
            id: 'assessments',
            menu_key: 'assessments',
            menu_label: 'Create Assessments',
            menu_icon: 'FileText',
            menu_url: '/assessments',
            sort_order: 1,
            is_dropdown: false,
            is_active: true
          },
          {
            id: 'grades',
            menu_key: 'grades',
            menu_label: 'Grade Management',
            menu_icon: 'Award',
            menu_url: '/student-grades',
            sort_order: 2,
            is_dropdown: false,
            is_active: true
          }
        ]
      },
      {
        id: 'instructor_management',
        menu_key: 'instructor_management',
        menu_label: 'Instructor Management',
        menu_icon: 'UserCheck',
        sort_order: 5,
        is_dropdown: false,
        is_active: true,
        children: [
          {
            id: 'instructor_management_page',
            menu_key: 'instructor_management_page',
            menu_label: 'Instructor Management',
            menu_icon: 'UserCheck',
            menu_url: '/instructor-management',
            sort_order: 1,
            is_dropdown: false,
            is_active: true
          }
        ]
      },
      {
        id: 'reports_analytics',
        menu_key: 'reports_analytics',
        menu_label: 'Reports & Analytics',
        menu_icon: 'BarChart3',
        sort_order: 6,
        is_dropdown: false,
        is_active: true,
        children: [
          {
            id: 'admin_dashboard',
            menu_key: 'admin_dashboard',
            menu_label: 'Analytics Dashboard',
            menu_icon: 'BarChart3',
            menu_url: '/admin-dashboard',
            sort_order: 1,
            is_dropdown: false,
            is_active: true
          },
          {
            id: 'reports',
            menu_key: 'reports',
            menu_label: 'Reports',
            menu_icon: 'FileText',
            menu_url: '/reports',
            sort_order: 2,
            is_dropdown: false,
            is_active: true
          }
        ]
      }
    ]

    // Ensure all defaults are normalized too
    const normalizeTree = (nodes: NavigationItem[]): NavigationItem[] =>
      nodes.map(n => {
        const normalized = this.normalizeItem(n)
        return {
          ...normalized,
          children: n.children ? normalizeTree(n.children) : []
        }
      })

    return normalizeTree(items)
  }
}
