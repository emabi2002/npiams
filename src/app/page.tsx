'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  GraduationCap,
  FileText,
  BarChart3,
  Users,
  Calendar,
  UserPlus,
  ExternalLink,
  TrendingUp,
  CreditCard,
  UserCheck,
  Settings,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            TVET Academic Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive academic management platform for courses, programs, assessments, and grades
          </p>
          <div className="flex justify-center items-center gap-2 mb-8">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              Database-Driven
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              TVET-Optimized
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
              Papua New Guinea Ready
            </Badge>
          </div>
          <p className="text-lg text-gray-700 mb-8">
            Welcome back, <span className="font-semibold text-blue-600">System Administrator</span>!
          </p>
        </div>

        {/* Student Registration Spotlight */}
        <div className="mb-16">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-800 flex items-center justify-center gap-2">
                <UserPlus className="w-6 h-6" />
                Student Registration System
              </CardTitle>
              <CardDescription className="text-lg">
                Complete online application and enrollment management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button asChild size="lg" className="h-16 bg-blue-600 hover:bg-blue-700">
                  <Link href="https://same-wgoiz1sb4xo-latest.netlify.app/" className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Online Application Portal</div>
                      <div className="text-xs opacity-90">New student applications</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 border-blue-200 hover:bg-blue-50">
                  <Link href="https://same-wgoiz1sb4xo-latest.netlify.app/admin" className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Review Applications</div>
                      <div className="text-xs text-gray-600">Admin processing</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 border-purple-200 hover:bg-purple-50">
                  <Link href="https://same-wgoiz1sb4xo-latest.netlify.app/tracking" className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Enrollment Tracking</div>
                      <div className="text-xs text-gray-600">Status monitoring</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Link>
                </Button>
              </div>
              <div className="text-center">
                <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-800">
                  <Link href="https://same-wgoiz1sb4xo-latest.netlify.app/student" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Student Portal Access
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Quick Actions
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Access core academic management functions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Course Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  Create and manage academic courses
                </CardDescription>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/courses" className="flex items-center gap-2">
                    Access <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit group-hover:bg-purple-200 transition-colors">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  Manage academic programs and curricula
                </CardDescription>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/programs" className="flex items-center gap-2">
                    Access <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit group-hover:bg-red-200 transition-colors">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-lg">Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  Create and manage student assessments
                </CardDescription>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/assessments" className="flex items-center gap-2">
                    Access <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  View and manage student grades
                </CardDescription>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/student-grades" className="flex items-center gap-2">
                    Access <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Core Features
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Everything you need for academic management
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <BookOpen className="w-5 h-5" />
                  Course Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Create and manage courses, set prerequisites, organize curriculum, and track academic content delivery across departments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <FileText className="w-5 h-5" />
                  Assessment Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Create various types of assessments, manage evaluation criteria, and track academic performance across courses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <GraduationCap className="w-5 h-5" />
                  Program Administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Design academic programs, set graduation requirements, manage curricula, and track program effectiveness.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <BarChart3 className="w-5 h-5" />
                  Grade Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Record grades, calculate GPAs, generate academic reports, and manage grading workflows for instructors.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Advanced TVET Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Fee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete fee workflow from definition to payment tracking and receipt generation
                </CardDescription>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/fee-management">Manage Fees</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit">
                  <UserCheck className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-lg">Instructor Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Course allocation, scheduling, and attendance tracking for instructors
                </CardDescription>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/instructor-management">Manage Instructors</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit">
                  <Settings className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Academic Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  TVET-specific calendar with terms, semesters, and academic periods
                </CardDescription>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/academic-calendar">View Calendar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Streamline Academic Operations</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Manage your institution's academic programs efficiently and effectively with our comprehensive TVET management system optimized for Papua New Guinea institutions.
          </p>
        </div>
      </div>
    </div>
  )
}
