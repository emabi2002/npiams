export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      code: "EE101",
      name: "Fundamentals of Electrical Engineering",
      program: "Diploma in Electrical Engineering",
      semester: 1,
      credits: 4,
      instructor: "Mr. John Kila",
      description: "Introduction to electrical circuits, voltage, current, and basic electrical components.",
      prerequisites: "None"
    },
    {
      id: 2,
      code: "EE201",
      name: "Power Systems and Distribution",
      program: "Diploma in Electrical Engineering",
      semester: 3,
      credits: 5,
      instructor: "Dr. Michael Temu",
      description: "Power generation, transmission, and distribution systems in PNG context.",
      prerequisites: "EE101"
    },
    {
      id: 3,
      code: "AT101",
      name: "Engine Fundamentals",
      program: "Certificate in Automotive Technology",
      semester: 1,
      credits: 4,
      instructor: "Mr. Peter Namaliu",
      description: "Internal combustion engines, diesel and petrol engine operations.",
      prerequisites: "None"
    },
    {
      id: 4,
      code: "BM101",
      name: "Introduction to Business",
      program: "Diploma in Business Management",
      semester: 1,
      credits: 3,
      instructor: "Ms. Mary Tau",
      description: "Business fundamentals, organizational structures, and management principles.",
      prerequisites: "None"
    },
    {
      id: 5,
      code: "BM301",
      name: "Entrepreneurship in PNG",
      program: "Diploma in Business Management",
      semester: 5,
      credits: 4,
      instructor: "Mr. James Pokana",
      description: "Starting and managing small businesses in Papua New Guinea context.",
      prerequisites: "BM101, BM201"
    },
    {
      id: 6,
      code: "AG101",
      name: "Tropical Agriculture",
      program: "Diploma in Agriculture Technology",
      semester: 1,
      credits: 4,
      instructor: "Dr. Sarah Mendi",
      description: "Agricultural practices suited to PNG's tropical climate and soil conditions.",
      prerequisites: "None"
    }
  ];

  const groupedBySemester = courses.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {} as Record<number, typeof courses>);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add New Course
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Comprehensive course management for all TVET programs with detailed curriculum structure.
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Courses</h3>
              <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Credits</h3>
              <p className="text-2xl font-bold text-green-600">
                {courses.reduce((total, course) => total + course.credits, 0)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Programs Covered</h3>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(courses.map(c => c.program)).size}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Semesters</h3>
              <p className="text-2xl font-bold text-orange-600">
                {Math.max(...courses.map(c => c.semester))}
              </p>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Programs</option>
              <option value="electrical">Electrical Engineering</option>
              <option value="automotive">Automotive Technology</option>
              <option value="business">Business Management</option>
              <option value="agriculture">Agriculture Technology</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
            </select>
          </div>
        </div>

        {/* Courses by Semester */}
        {Object.entries(groupedBySemester).map(([semester, semesterCourses]) => (
          <div key={semester} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Semester {semester}</h2>
            <div className="grid grid-cols-1 gap-4">
              {semesterCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                          {course.code}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-800">{course.name}</h3>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {course.credits} Credits
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Program:</span> {course.program}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Instructor:</span> {course.instructor}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Prerequisites:</span> {course.prerequisites}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4">{course.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Syllabus
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Edit Course
                      </button>
                      <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                        Assessments
                      </button>
                      <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                        Enrollment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
