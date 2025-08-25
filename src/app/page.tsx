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
  UserPlus,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ===== Compact Hero ===== */}
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-3">
        <div className="text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            TVET Academic Management System
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Courses • Programs • Assessments • Grades
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <Badge variant="outline" className="border-blue-300 bg-blue-100 text-blue-800">Database-Driven</Badge>
            <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">TVET-Optimized</Badge>
            <Badge variant="outline" className="border-purple-300 bg-purple-100 text-purple-800">Papua New Guinea Ready</Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-6">
        {/* ===== Academic Management System ===== */}
        <div className="mb-3">
          <h2 className="text-lg font-bold text-gray-900">Academic Management System</h2>
          <div className="mt-2 h-[2px] w-full rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-sky-400" />
        </div>

        {/* AMS quick actions (compact 4-up) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-1 w-fit rounded-full bg-blue-100 p-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base">Course Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-2 text-center text-xs">
                Create and manage courses
              </CardDescription>
              <Button asChild size="sm" variant="outline" className="w-full h-8 text-sm">
                <Link href="/courses" className="flex items-center gap-1">
                  Access <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-1 w-fit rounded-full bg-purple-100 p-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Programs</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-2 text-center text-xs">
                Academic programs & curricula
              </CardDescription>
              <Button asChild size="sm" variant="outline" className="w-full h-8 text-sm">
                <Link href="/programs" className="flex items-center gap-1">
                  Access <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-1 w-fit rounded-full bg-red-100 p-2">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-base">Assessments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-2 text-center text-xs">
                Build & manage assessments
              </CardDescription>
              <Button asChild size="sm" variant="outline" className="w-full h-8 text-sm">
                <Link href="/assessments" className="flex items-center gap-1">
                  Access <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-1 w-fit rounded-full bg-green-100 p-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-base">Grades</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-2 text-center text-xs">
                View & manage grades
              </CardDescription>
              <Button asChild size="sm" variant="outline" className="w-full h-8 text-sm">
                <Link href="/student-grades" className="flex items-center gap-1">
                  Access <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ===== Students Registration System ===== */}
        <div className="mt-6 mb-3">
          <h2 className="text-lg font-bold text-gray-900">Students Registration System</h2>
          <div className="mt-2 h-[2px] w-full rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-red-500" />
        </div>

        {/* SRS actions (compact 3-up) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-1 w-fit rounded-full bg-blue-100 p-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base">Online Application Portal</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-2 text-center text-xs">
                New student applications
              </CardDescription>
              <Button asChild size="sm" variant="outline" className="w-full h-8 text-sm">
                <Link href="/admissions/apply" className="flex items-center gap-1">
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-1 w-fit rounded-full bg-indigo-100 p-2">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="text-base">Review Applications</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-2 text-center text-xs">
                Admin processing
              </CardDescription>
              <Button asChild size="sm" variant="outline" className="w-full h-8 text-sm">
                <Link href="/admissions/admin" className="flex items-center gap-1">
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-1 w-fit rounded-full bg-rose-100 p-2">
                <TrendingUp className="h-5 w-5 text-rose-600" />
              </div>
              <CardTitle className="text-base">Enrollment Tracking</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-2 text-center text-xs">
                Status monitoring
              </CardDescription>
              <Button asChild size="sm" variant="outline" className="w-full h-8 text-sm">
                <Link href="/admissions/status" className="flex items-center gap-1">
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
