"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Users, GraduationCap, TrendingUp, Award } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  // Sample data for charts
  const enrollmentByProgram = [
    { name: 'Electrical Engineering', students: 125, capacity: 150 },
    { name: 'Business Management', students: 156, capacity: 180 },
    { name: 'Automotive Technology', students: 98, capacity: 120 },
    { name: 'Agriculture Technology', students: 112, capacity: 130 },
    { name: 'Community Health', students: 73, capacity: 100 },
    { name: 'Office Administration', students: 87, capacity: 100 }
  ];

  const enrollmentTrend = [
    { year: '2020', total: 487, new: 145, graduated: 98 },
    { year: '2021', total: 534, new: 167, graduated: 120 },
    { year: '2022', total: 598, new: 189, graduated: 125 },
    { year: '2023', total: 645, new: 201, graduated: 154 },
    { year: '2024', total: 651, new: 178, graduated: 172 }
  ];

  const gpaDistribution = [
    { grade: 'Excellent (3.5-4.0)', count: 145, percentage: 22.3 },
    { grade: 'Good (3.0-3.49)', count: 234, percentage: 35.9 },
    { grade: 'Satisfactory (2.5-2.99)', count: 187, percentage: 28.7 },
    { grade: 'Need Improvement (2.0-2.49)', count: 65, percentage: 10.0 },
    { grade: 'Below Standard (<2.0)', count: 20, percentage: 3.1 }
  ];

  const provinceDistribution = [
    { name: 'National Capital District', value: 156, color: '#3B82F6' },
    { name: 'Western Province', value: 89, color: '#10B981' },
    { name: 'Southern Highlands', value: 78, color: '#F59E0B' },
    { name: 'Morobe Province', value: 65, color: '#EF4444' },
    { name: 'East New Britain', value: 54, color: '#8B5CF6' },
    { name: 'Others', value: 209, color: '#6B7280' }
  ];

  const programPerformance = [
    { program: 'Electrical Engineering', completionRate: 87.5, employmentRate: 92.3, avgGPA: 3.2 },
    { program: 'Business Management', completionRate: 91.2, employmentRate: 88.7, avgGPA: 3.4 },
    { program: 'Automotive Technology', completionRate: 89.8, employmentRate: 94.1, avgGPA: 3.1 },
    { program: 'Agriculture Technology', completionRate: 85.3, employmentRate: 85.2, avgGPA: 3.3 },
    { program: 'Community Health', completionRate: 93.7, employmentRate: 96.8, avgGPA: 3.6 }
  ];

  const totalStudents = enrollmentByProgram.reduce((sum, program) => sum + program.students, 0);
  const totalCapacity = enrollmentByProgram.reduce((sum, program) => sum + program.capacity, 0);
  const utilizationRate = (totalStudents / totalCapacity * 100).toFixed(1);
  const avgGPA = 3.2;
  const graduationRate = 88.5;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Current Semester</option>
              <option>Previous Semester</option>
              <option>Academic Year 2024</option>
              <option>Academic Year 2023</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-600" size={24} />
              <h3 className="font-semibold text-blue-800">Total Students</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            <p className="text-sm text-blue-700 mt-1">
              Capacity utilization: {utilizationRate}%
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="text-green-600" size={24} />
              <h3 className="font-semibold text-green-800">Graduation Rate</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{graduationRate}%</p>
            <p className="text-sm text-green-700 mt-1">Above national average</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-purple-600" size={24} />
              <h3 className="font-semibold text-purple-800">Average GPA</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{avgGPA}</p>
            <p className="text-sm text-purple-700 mt-1">Academic performance</p>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-orange-600" size={24} />
              <h3 className="font-semibold text-orange-800">Growth Rate</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">+8.7%</p>
            <p className="text-sm text-orange-700 mt-1">Year-over-year enrollment</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enrollment by Program */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment by Program</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentByProgram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3B82F6" name="Current Students" />
                <Bar dataKey="capacity" fill="#E5E7EB" name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Province Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Distribution by Province</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={provinceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {provinceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enrollment Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  name="Total Students"
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="New Enrollments"
                />
                <Line
                  type="monotone"
                  dataKey="graduated"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Graduated"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* GPA Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">GPA Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gpaDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="grade"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Program Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Program</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Completion Rate</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Employment Rate</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Average GPA</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Performance</th>
                </tr>
              </thead>
              <tbody>
                {programPerformance.map((program, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{program.program}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${program.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{program.completionRate}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${program.employmentRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{program.employmentRate}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{program.avgGPA}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        program.completionRate >= 90 && program.employmentRate >= 90
                          ? 'bg-green-100 text-green-800'
                          : program.completionRate >= 85 && program.employmentRate >= 85
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {program.completionRate >= 90 && program.employmentRate >= 90
                          ? 'Excellent'
                          : program.completionRate >= 85 && program.employmentRate >= 85
                          ? 'Good'
                          : 'Needs Improvement'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
