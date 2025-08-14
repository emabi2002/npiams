"use client";

import { useState } from "react";
import { Search, Filter, Download, FileText, Eye } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function GradeManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<typeof studentGrades[0] | null>(null);

  const studentGrades = [
    {
      id: 1,
      studentId: "NPI2024001",
      studentName: "James Pokana",
      program: "Diploma in Electrical Engineering",
      semester: 3,
      courses: [
        { code: "EE101", name: "Fundamentals of Electrical Engineering", credits: 4, grade: "B+", gpa: 3.3, marks: "83/100" },
        { code: "EE201", name: "Power Systems", credits: 5, grade: "A-", gpa: 3.7, marks: "87/100" },
        { code: "EE202", name: "Electronics", credits: 4, grade: "B", gpa: 3.0, marks: "78/100" },
        { code: "MT201", name: "Engineering Mathematics", credits: 3, grade: "B+", gpa: 3.3, marks: "81/100" }
      ],
      cgpa: 3.2,
      totalCredits: 48,
      status: "Good Standing"
    },
    {
      id: 2,
      studentId: "NPI2024002",
      studentName: "Sarah Mendi",
      program: "Diploma in Business Management",
      semester: 5,
      courses: [
        { code: "BM301", name: "Strategic Management", credits: 4, grade: "A", gpa: 4.0, marks: "92/100" },
        { code: "BM302", name: "Financial Management", credits: 4, grade: "A-", gpa: 3.7, marks: "88/100" },
        { code: "BM303", name: "Marketing Management", credits: 3, grade: "A", gpa: 4.0, marks: "94/100" },
        { code: "BM304", name: "Human Resource Management", credits: 3, grade: "B+", gpa: 3.3, marks: "85/100" }
      ],
      cgpa: 3.8,
      totalCredits: 72,
      status: "Dean's List"
    }
  ];

  const generateTranscript = async (student: typeof studentGrades[0]) => {
    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("NATIONAL POLYTECHNIC INSTITUTE", 105, 30, { align: "center" });
    pdf.setFontSize(16);
    pdf.text("OFFICIAL ACADEMIC TRANSCRIPT", 105, 45, { align: "center" });

    // Student Information
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Student Information:", 20, 70);
    pdf.text(`Name: ${student.studentName}`, 20, 85);
    pdf.text(`Student ID: ${student.studentId}`, 20, 95);
    pdf.text(`Program: ${student.program}`, 20, 105);
    pdf.text(`Current Semester: ${student.semester}`, 20, 115);
    pdf.text(`CGPA: ${student.cgpa}`, 20, 125);
    pdf.text(`Total Credits: ${student.totalCredits}`, 20, 135);
    pdf.text(`Status: ${student.status}`, 20, 145);

    // Courses Header
    pdf.setFont("helvetica", "bold");
    pdf.text("Academic Record:", 20, 165);

    // Table Headers
    pdf.setFontSize(10);
    pdf.text("Course Code", 20, 180);
    pdf.text("Course Name", 50, 180);
    pdf.text("Credits", 130, 180);
    pdf.text("Marks", 150, 180);
    pdf.text("Grade", 170, 180);
    pdf.text("GPA", 185, 180);

    // Draw line under headers
    pdf.line(20, 185, 200, 185);

    // Course Details
    pdf.setFont("helvetica", "normal");
    let yPosition = 195;
    student.courses.forEach((course) => {
      pdf.text(course.code, 20, yPosition);
      pdf.text(course.name.substring(0, 25), 50, yPosition);
      pdf.text(course.credits.toString(), 130, yPosition);
      pdf.text(course.marks, 150, yPosition);
      pdf.text(course.grade, 170, yPosition);
      pdf.text(course.gpa.toString(), 185, yPosition);
      yPosition += 10;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.text("This is an official transcript issued by NPI Academic Records Office", 105, 270, { align: "center" });
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 280, { align: "center" });

    // Save the PDF
    pdf.save(`${student.studentName}_Transcript.pdf`);
  };

  const filteredStudents = studentGrades.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = filterProgram === "all" || student.program.toLowerCase().includes(filterProgram.toLowerCase());
    return matchesSearch && matchesProgram;
  });

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dean's List": return "bg-green-100 text-green-800";
      case "Good Standing": return "bg-blue-100 text-blue-800";
      case "Academic Warning": return "bg-yellow-100 text-yellow-800";
      case "Academic Probation": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Grade Management</h1>
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download size={16} />
              Export Grades
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Grade Entry
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-green-800 mb-2">Average CGPA</h3>
            <p className="text-3xl font-bold text-green-600">
              {(studentGrades.reduce((sum, s) => sum + s.cgpa, 0) / studentGrades.length).toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-blue-800 mb-2">Dean's List</h3>
            <p className="text-3xl font-bold text-blue-600">
              {studentGrades.filter(s => s.status === "Dean's List").length}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-purple-800 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-purple-600">{studentGrades.length}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-orange-800 mb-2">Courses Graded</h3>
            <p className="text-3xl font-bold text-orange-600">
              {studentGrades.reduce((sum, s) => sum + s.courses.length, 0)}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Programs</option>
                <option value="electrical">Electrical Engineering</option>
                <option value="business">Business Management</option>
                <option value="automotive">Automotive Technology</option>
                <option value="agriculture">Agriculture Technology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Grades */}
        <div className="space-y-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{student.studentName}</h3>
                  <p className="text-gray-600">{student.studentId} • {student.program}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600">Semester {student.semester}</span>
                    <span className="text-sm font-semibold">CGPA: {student.cgpa}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    {selectedStudent?.id === student.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => generateTranscript(student)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Transcript
                  </button>
                </div>
              </div>

              {selectedStudent?.id === student.id && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-semibold text-gray-700">Course Code</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Course Name</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Credits</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Marks</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Grade</th>
                          <th className="text-left p-3 font-semibold text-gray-700">GPA Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.courses.map((course, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-mono">{course.code}</td>
                            <td className="p-3">{course.name}</td>
                            <td className="p-3">{course.credits}</td>
                            <td className="p-3">{course.marks}</td>
                            <td className="p-3">
                              <span className={`font-semibold ${getGradeColor(course.grade)}`}>
                                {course.grade}
                              </span>
                            </td>
                            <td className="p-3 font-semibold">{course.gpa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Total Credits Completed:</span>
                        <p className="font-semibold">{student.totalCredits}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Cumulative GPA:</span>
                        <p className="font-semibold">{student.cgpa}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Academic Standing:</span>
                        <p className="font-semibold">{student.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
