'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileText,
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  // AMS quick actions
  const quickActions = [
    {
      title: 'Course Management',
      description: 'Manage courses and curriculum',
      href: '/courses',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Programs',
      description: 'Academic programs',
      href: '/programs',
      icon: GraduationCap,
      color: 'bg-purple-500',
    },
    {
      title: 'Assessments',
      description: 'Assessment management',
      href: '/assessments',
      icon: ClipboardList,
      color: 'bg-red-500',
    },
    {
      title: 'Grades',
      description: 'Grade management',
      href: '/student-grades',
      icon: FileText,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Welcome */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Manage your academic operations from this dashboard.
        </p>
      </section>

      {/* =========== Academic Management System (TOP) =========== */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Academic Management System</h2>
          {/* strong, visible line under the header */}
          <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />
        </div>

        {/* AMS Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently offered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programs</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Academic programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Total assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Require grading</p>
            </CardContent>
          </Card>
        </div>

        {/* AMS Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {action.description}
                      </CardDescription>
                      <div className="flex items-center text-primary font-medium">
                        <span>Access</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* AMS Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Course updated</p>
                    <p className="text-xs text-gray-500">
                      Introduction to Programming - Curriculum revised
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assessment created</p>
                    <p className="text-xs text-gray-500">Mathematics Quiz - Week 3</p>
                  </div>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Grades processed</p>
                    <p className="text-xs text-gray-500">
                      Computer Science - Assignment 2
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SUPER-VISIBLE DIVIDER BETWEEN THE TWO SYSTEMS */}
      <div className="my-8">
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* =========== Students Registration System (BOTTOM) =========== */}
      <section className="space-y-4 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Students Registration System</h2>
          {/* strong, visible line under the header */}
          <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Registration System</CardTitle>
            <CardDescription>
              Complete online application and enrollment management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/admissions/apply"
                className="block rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Online Application Portal</div>
                    <div className="text-xs text-muted-foreground">
                      New student applications
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>

              <Link
                href="/admissions/admin"
                className="block rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Review Applications</div>
                    <div className="text-xs text-muted-foreground">Admin processing</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>

              <Link
                href="/admissions/status"
                className="block rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enrollment Tracking</div>
                    <div className="text-xs text-muted-foreground">Status monitoring</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>

            {/* optional student portal link */}
            <div className="mt-4 text-center">
              <Link href="/admissions/status" className="text-sm underline">
                Student Portal Access →
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
