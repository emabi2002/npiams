// src/components/layout/Header.tsx (Original Restored Version)

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  GraduationCap, BookOpen, FileText, ClipboardList, Settings, LogOut,
  Building2, Users, UserPlus, BarChart3, CalendarDays, Calendar,
  CreditCard, UserCheck, Award, TrendingUp
} from 'lucide-react'
import { useState, useEffect, ReactNode } from 'react'
import { NavigationService, type NavigationItem } from '@/lib/services/navigation'

const iconMap: Record<string, any> = {
  Settings, Users, CreditCard, ClipboardList, UserCheck, BarChart3, Calendar,
  CalendarDays, Building2, GraduationCap, BookOpen, UserPlus, FileText, Award, TrendingUp
}

type NavigationGroup = {
  title: string
  icon: any
  items: NavigationItem[]
}

type HeaderProps = {
  children: ReactNode
}

export function Header({ children }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [navigationGroups, setNavigationGroups] = useState<NavigationGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadNavigation = async () => {
      try {
        setIsLoading(true)
        const navigation = await NavigationService.getNavigationStructure()
        const filteredNavigation = NavigationService.filterNavigationByRole(navigation, user?.role)

        const groups: NavigationGroup[] = filteredNavigation.map(item => ({
          title: item.menu_label,
          icon: iconMap[item.menu_icon || 'Settings'] || Settings,
          items: (item.children || []).map(child => ({
            ...child,
            icon: iconMap[child.menu_icon || 'FileText'] || FileText,
            external: child.menu_url?.startsWith('http')
          }))
        }))

        setNavigationGroups(groups)
      } catch (error) {
        console.error('Navigation load failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNavigation()
  }, [user?.role])

  const handleSignOut = async () => await signOut()

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gradient-to-b from-green-900 to-green-600 text-white p-4 overflow-y-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Image src="/images/npi-logo.png" alt="Logo" width={36} height={36} />
          <span className="text-lg font-bold leading-tight">TVET Academic System</span>
        </div>

        <nav className="space-y-6">
          {navigationGroups.map(group => (
            <div key={group.title}>
              <div className="flex items-center space-x-2 font-semibold text-white/90 mb-1">
                <group.icon className="h-4 w-4" />
                <span>{group.title}</span>
              </div>
              <ul className="ml-4 mt-2 space-y-1">
                {group.items.map(item => (
                  <li key={item.menu_key}>
                    {item.external ? (
                      <a
                        href={item.menu_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.menu_label}</span>
                      </a>
                    ) : (
                      <Link href={item.menu_url || '#'}>
                        <span className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors">
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm">{item.menu_label}</span>
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b px-4 flex justify-end items-center shadow-sm">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={''} alt={user.full_name || ''} />
                  <AvatarFallback>
                    {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="text-sm font-medium">{user.full_name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <Button variant="ghost" onClick={handleSignOut} className="text-sm">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
