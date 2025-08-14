"use client";

import { useState } from "react";
import { Search, Filter, Download, UserPlus } from "lucide-react";

export default function StudentProfilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const students = [
    {
      id: 1,
      studentId: "NPI2024001",
      fullName: "James Pokana",
      email: "james.pokana@student.npi.edu.pg",
      phone: "+675 7123 4567",
      program: "Diploma in Electrical Engineering",
      semester: 3,
      status: "active",
      gpa: 3.2,
      enrollmentDate: "2024-02-15",
      province: "Western Province",
      address: "Daru, Western Province"
    },
    {
      id: 2,
      studentId: "NPI2024002",
      fullName: "Sarah Mendi",
      email: "sarah.mendi@student.npi.edu.pg",
      phone: "+675 7234 5678",
      program: "Diploma in Business Management",
      semester: 5,
      status: "active",
      gpa: 3.8,
      enrollmentDate: "2023-02-20",
      province: "Southern Highlands",
      address: "Mendi, Southern Highlands"
    },
    {
      id: 3,
      studentId: "NPI2024003",
      fullName: "Michael Temu",
      email: "michael.temu@student.npi.edu.pg",
      phone: "+675 7345 6789",
      program: "Certificate in Automotive Technology",
      semester: 2,
      status: "active",
      gpa: 3.5,
      enrollmentDate: "2024-01-10",
      province: "Morobe Province",
      address: "Lae, Morobe Province"
    },
    {
      id: 4,
      studentId: "NPI2023045",
      fullName: "Grace Mondo",
      email: "grace.mondo@student.npi.edu.pg",
      phone: "+675 7456 7890",
      program: "Certificate in Community Health",
      semester: 4,
      status: "graduated",
      gpa: 3.9,
      enrollmentDate: "2023-01-15",
      province: "National Capital District",
      address: "Port Moresby, NCD"
    },
    {
      id: 5,
      studentId: "NPI2024005",
      fullName: "Peter Namaliu",
      email: "peter.namaliu@student.npi.edu.pg",
      phone: "+675 7567 8901",
      program: "Diploma in Agriculture Technology",
      semester: 1,
      status: "suspended",
      gpa: 2.1,
      enrollmentDate: "2024-02-01",
      province: "East New Britain",
      address: "Kokopo, East New Britain"
    }
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "graduated": return "bg-blue-100 text-blue-800";
      case "suspended": return "bg-red-100 text-red-800";
      case "withdrawn": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return "text-green-600";
    if (gpa >= 3.0) return "text-blue-600";
    if (gpa >= 2.5) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Student Profiles</h1>
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download size={16} />
              Export Data
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <UserPlus size={16} />
              Add Student
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Students</h3>
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Active Students</h3>
              <p className="text-2xl font-bold text-green-600">
                {students.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Graduated</h3>
              <p className="text-2xl font-bold text-purple-600">
                {students.filter(s => s.status === 'graduated').length}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Average GPA</h3>
              <p className="text-2xl font-bold text-orange-600">
                {(students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(1)}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, student ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Program</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Semester</th>
                  <th className="text-left p-4 font-semibold text-gray-700">GPA</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-800">{student.fullName}</div>
                        <div className="text-sm text-gray-600">{student.studentId}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">{student.program}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">Semester {student.semester}</div>
                    </td>
                    <td className="p-4">
                      <div className={`font-semibold ${getGPAColor(student.gpa)}`}>
                        {student.gpa.toFixed(1)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">{student.province}</div>
                      <div className="text-xs text-gray-500">{student.address}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View Profile</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">Edit Details</button>
                        <button className="text-purple-600 hover:text-purple-800 text-sm">Transcript</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found matching your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
