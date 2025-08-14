"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, Users, Edit, Trash2, Eye } from "lucide-react";

export default function CreateAssessmentsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    course: '',
    type: 'exam',
    date: '',
    duration: '',
    totalMarks: '',
    instructions: ''
  });

  const assessments = [
    {
      id: 1,
      title: "Midterm Examination",
      course: "EE201 - Power Systems",
      type: "exam",
      date: "2024-09-15",
      time: "09:00",
      duration: "3 hours",
      totalMarks: 100,
      studentsAssigned: 25,
      status: "scheduled",
      instructions: "Closed book examination. Calculator permitted."
    },
    {
      id: 2,
      title: "Circuit Analysis Assignment",
      course: "EE101 - Fundamentals of Electrical Engineering",
      type: "assignment",
      date: "2024-09-20",
      time: "23:59",
      duration: "7 days",
      totalMarks: 50,
      studentsAssigned: 30,
      status: "active",
      instructions: "Submit via online portal. Include all calculations and diagrams."
    },
    {
      id: 3,
      title: "Business Plan Project",
      course: "BM301 - Strategic Management",
      type: "project",
      date: "2024-10-01",
      time: "17:00",
      duration: "4 weeks",
      totalMarks: 200,
      studentsAssigned: 22,
      status: "active",
      instructions: "Group project with presentation. Maximum 5 members per group."
    },
    {
      id: 4,
      title: "Engine Components Quiz",
      course: "AT101 - Engine Fundamentals",
      type: "quiz",
      date: "2024-08-25",
      time: "14:00",
      duration: "45 minutes",
      totalMarks: 25,
      studentsAssigned: 18,
      status: "completed",
      instructions: "Online quiz. One attempt only."
    }
  ];

  const courses = [
    "EE101 - Fundamentals of Electrical Engineering",
    "EE201 - Power Systems",
    "BM301 - Strategic Management",
    "AT101 - Engine Fundamentals",
    "AG101 - Tropical Agriculture",
    "CH101 - Community Health Basics"
  ];

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating assessment:', newAssessment);
    setShowCreateForm(false);
    setNewAssessment({
      title: '',
      course: '',
      type: 'exam',
      date: '',
      duration: '',
      totalMarks: '',
      instructions: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "graded": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "exam": return "bg-red-100 text-red-800";
      case "assignment": return "bg-blue-100 text-blue-800";
      case "project": return "bg-purple-100 text-purple-800";
      case "quiz": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Assessment Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Create Assessment
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-blue-800 mb-2">Total Assessments</h3>
            <p className="text-3xl font-bold text-blue-600">{assessments.length}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-green-800 mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600">
              {assessments.filter(a => a.status === 'active').length}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-purple-800 mb-2">Scheduled</h3>
            <p className="text-3xl font-bold text-purple-600">
              {assessments.filter(a => a.status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-orange-800 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-orange-600">
              {assessments.reduce((sum, a) => sum + a.studentsAssigned, 0)}
            </p>
          </div>
        </div>

        {/* Create Assessment Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Create New Assessment</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Title
                  </label>
                  <input
                    type="text"
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter assessment title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <select
                    value={newAssessment.course}
                    onChange={(e) => setNewAssessment({...newAssessment, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course, index) => (
                      <option key={index} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Type
                  </label>
                  <select
                    value={newAssessment.type}
                    onChange={(e) => setNewAssessment({...newAssessment, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newAssessment.date}
                    onChange={(e) => setNewAssessment({...newAssessment, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newAssessment.duration}
                    onChange={(e) => setNewAssessment({...newAssessment, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2 hours, 3 days, 1 week"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={newAssessment.totalMarks}
                    onChange={(e) => setNewAssessment({...newAssessment, totalMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={newAssessment.instructions}
                  onChange={(e) => setNewAssessment({...newAssessment, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter detailed instructions for students..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Assessment
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assessments List */}
        <div className="space-y-6">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{assessment.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(assessment.type)}`}>
                      {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                      {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{assessment.course}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(assessment.date).toLocaleDateString()} at {assessment.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{assessment.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{assessment.studentsAssigned} students</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Total Marks:</span> {assessment.totalMarks}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    <span className="font-medium">Instructions:</span> {assessment.instructions}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
