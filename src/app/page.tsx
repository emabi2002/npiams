import { GraduationCap, Users, BookOpen, FileText, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const quickStats = [
    { label: "Total Students", value: "651", icon: Users, color: "blue", trend: "+8.7%" },
    { label: "Active Programs", value: "15", icon: BookOpen, color: "green", trend: "+2" },
    { label: "Pending Applications", value: "23", icon: FileText, color: "orange", trend: "+5" },
    { label: "This Week Graduates", value: "12", icon: GraduationCap, color: "purple", trend: "→" }
  ];

  const recentActivities = [
    { type: "application", message: "New application from James Pokana for Electrical Engineering", time: "2 hours ago", status: "pending" },
    { type: "enrollment", message: "Sarah Mendi successfully enrolled in Business Management", time: "4 hours ago", status: "completed" },
    { type: "assessment", message: "Midterm Exam scheduled for EE201 - Power Systems", time: "6 hours ago", status: "scheduled" },
    { type: "payment", message: "Payment received from Michael Temu (K1,500)", time: "1 day ago", status: "completed" },
    { type: "grade", message: "Grades uploaded for AT101 - Engine Fundamentals", time: "2 days ago", status: "completed" }
  ];

  const enrollmentWorkflow = [
    { step: 1, title: "Application Submission", description: "Student submits online application with documents", status: "active" },
    { step: 2, title: "Document Review", description: "Academic office reviews submitted documents", status: "pending" },
    { step: 3, title: "Interview/Assessment", description: "Conduct entrance interview or assessment", status: "pending" },
    { step: 4, title: "Admission Decision", description: "Committee makes admission decision", status: "pending" },
    { step: 5, title: "Fee Payment", description: "Student pays enrollment fees", status: "pending" },
    { step: 6, title: "Course Registration", description: "Student registers for courses", status: "pending" },
    { step: 7, title: "Enrollment Complete", description: "Student officially enrolled", status: "pending" }
  ];

  const upcomingEvents = [
    { date: "Aug 15", title: "New Student Orientation", type: "orientation" },
    { date: "Aug 20", title: "Semester Registration Deadline", type: "deadline" },
    { date: "Sep 1", title: "Classes Begin - Semester 2", type: "academic" },
    { date: "Sep 15", title: "Midterm Exams", type: "exam" }
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6">
            <GraduationCap size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">TVET Academic Management System</h1>
          <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
            Comprehensive academic management platform for courses, programs, assessments, and grades
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
              Database-Driven
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
              TVET-Optimized
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
              Papua New Guinea Ready
            </span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome back, <span className="text-blue-600">System Administrator</span>!
            </h2>
            <p className="text-gray-600">Here's what's happening at NPI today.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <stat.icon className={`text-${stat.color}-600`} size={24} />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.trend.startsWith('+') ? 'text-green-600' :
                    stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Student Enrollment Workflow */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Student Enrollment Workflow</h3>
                <Link href="/new-applications" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Applications →
                </Link>
              </div>
              <div className="space-y-4">
                {enrollmentWorkflow.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === 'active' ? 'bg-blue-600 text-white' :
                      step.status === 'completed' ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800">{step.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'pending' ? 'bg-yellow-500' :
                      activity.status === 'scheduled' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/new-applications" className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <FileText className="text-blue-600 mb-2" size={20} />
                  <p className="text-sm font-medium text-gray-800">New Applications</p>
                  <p className="text-xs text-gray-600">Review pending</p>
                </Link>
                <Link href="/student-profiles" className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                  <Users className="text-green-600 mb-2" size={20} />
                  <p className="text-sm font-medium text-gray-800">Student Profiles</p>
                  <p className="text-xs text-gray-600">Manage records</p>
                </Link>
                <Link href="/create-assessments" className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                  <BookOpen className="text-purple-600 mb-2" size={20} />
                  <p className="text-sm font-medium text-gray-800">Create Assessment</p>
                  <p className="text-xs text-gray-600">Schedule exams</p>
                </Link>
                <Link href="/analytics-dashboard" className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                  <TrendingUp className="text-orange-600 mb-2" size={20} />
                  <p className="text-sm font-medium text-gray-800">Analytics</p>
                  <p className="text-xs text-gray-600">View reports</p>
                </Link>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {event.date}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800">{event.title}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                        event.type === 'exam' ? 'bg-orange-100 text-orange-800' :
                        event.type === 'academic' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
