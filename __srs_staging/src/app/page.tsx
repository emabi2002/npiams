'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Building,
  AlertCircle
} from 'lucide-react'
import { getPrograms, getDashboardStats } from '@/lib/database'
import { toast } from 'sonner'

interface Program {
  id: string
  name: string
  code: string
  level: 'certificate' | 'diploma'
  department: string
  duration_months: number
  description: string | null
}

interface Stats {
  totalStudents: number
  pendingApplications: number
  verifiedStudents: number
  totalPrograms: number
  pendingPayments: number
}

export default function HomePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch programs and stats in parallel
      const [programsData, statsData] = await Promise.all([
        getPrograms(),
        getDashboardStats()
      ])

      setPrograms(programsData || [])
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try refreshing the page.')
      toast.error('Failed to load programs and statistics')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Clock,
      title: "24/7 Online Application",
      description: "Apply anytime, anywhere with our secure online platform"
    },
    {
      icon: CheckCircle,
      title: "Instant Verification",
      description: "Real-time document verification and application status updates"
    },
    {
      icon: Award,
      title: "Quality Programs",
      description: "Certificate and Diploma programs accredited by PNG standards"
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Dedicated admissions team to guide you through the process"
    }
  ]

  const displayStats = stats ? [
    { label: "Students Enrolled", value: stats.totalStudents.toString(), icon: Users },
    { label: "Programs Available", value: stats.totalPrograms.toString(), icon: BookOpen },
    { label: "Years of Excellence", value: "25+", icon: Award },
    { label: "Verified Students", value: stats.verifiedStudents.toString(), icon: CheckCircle }
  ] : []

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-full">
                <GraduationCap className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to NPI PNG
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              National Polytechnic Institute of Papua New Guinea
            </p>
            <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
              Start your journey in Technical and Vocational Education. Apply now for our
              Certificate and Diploma programs in Engineering, Business, and Technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                <Link href="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/student-portal">
                  Student Portal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="text-center animate-pulse">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-200 p-3 rounded-full w-12 h-12" />
                  </div>
                  <div className="bg-gray-200 h-8 w-16 mx-auto mb-2 rounded" />
                  <div className="bg-gray-200 h-4 w-24 mx-auto rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {displayStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Registration System?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience a modern, efficient, and secure way to apply for your education
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available Programs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of technical and vocational programs
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="bg-gray-200 h-6 w-3/4 rounded mb-2" />
                    <div className="flex gap-2">
                      <div className="bg-gray-200 h-5 w-16 rounded" />
                      <div className="bg-gray-200 h-5 w-12 rounded" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="bg-gray-200 h-4 w-1/2 rounded" />
                      <div className="bg-gray-200 h-4 w-1/3 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : programs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {programs.slice(0, 4).map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg mb-2">{program.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={program.level === 'diploma' ? 'default' : 'secondary'}>
                            {program.level?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          <Badge variant="outline">{program.code}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Duration: {Math.floor(program.duration_months / 12)} years {program.duration_months % 12} months</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>Department: {program.department}</span>
                      </div>
                      {program.description && (
                        <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                          {program.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Available</h3>
              <p className="text-gray-600">Programs will be displayed here once they are added to the system.</p>
            </div>
          )}

          {programs.length > 4 && (
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/programs">
                  View All {programs.length} Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Education Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who have built successful careers through our programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              <Link href="/apply">
                Start Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">
                Contact Admissions
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Phone className="h-8 w-8 mb-4 text-blue-400" />
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-300">+675 XXX XXXX</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="h-8 w-8 mb-4 text-blue-400" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-300">admissions@npi.ac.pg</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-8 w-8 mb-4 text-blue-400" />
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-gray-300">Port Moresby, Papua New Guinea</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
