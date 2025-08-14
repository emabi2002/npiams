export default function ProgramsPage() {
  const programs = [
    {
      id: 1,
      name: "Diploma in Electrical Engineering",
      department: "Engineering & Technology",
      duration: "3 years",
      students: 125,
      description: "Comprehensive electrical engineering program covering power systems, electronics, and industrial automation."
    },
    {
      id: 2,
      name: "Certificate in Automotive Technology",
      department: "Engineering & Technology",
      duration: "2 years",
      students: 98,
      description: "Hands-on automotive repair and maintenance training for modern vehicles."
    },
    {
      id: 3,
      name: "Diploma in Business Management",
      department: "Business & Commerce",
      duration: "3 years",
      students: 156,
      description: "Business fundamentals, management principles, and entrepreneurship skills."
    },
    {
      id: 4,
      name: "Certificate in Office Administration",
      department: "Business & Commerce",
      duration: "1 year",
      students: 87,
      description: "Essential office skills including computer applications and administrative procedures."
    },
    {
      id: 5,
      name: "Diploma in Agriculture Technology",
      department: "Agriculture & Applied Sciences",
      duration: "3 years",
      students: 112,
      description: "Modern farming techniques, crop management, and sustainable agriculture practices."
    },
    {
      id: 6,
      name: "Certificate in Community Health",
      department: "Health & Community Services",
      duration: "2 years",
      students: 73,
      description: "Basic healthcare, community health education, and primary care assistance."
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Programs</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add New Program
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Manage TVET programs offered across all departments with comprehensive curriculum structure.
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Programs</h3>
              <p className="text-2xl font-bold text-blue-600">{programs.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Enrolled</h3>
              <p className="text-2xl font-bold text-green-600">
                {programs.reduce((total, program) => total + program.students, 0)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Diploma Programs</h3>
              <p className="text-2xl font-bold text-purple-600">
                {programs.filter(p => p.name.includes('Diploma')).length}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Certificate Programs</h3>
              <p className="text-2xl font-bold text-orange-600">
                {programs.filter(p => p.name.includes('Certificate')).length}
              </p>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{program.name}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {program.duration}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span> {program.department}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Enrolled Students:</span> {program.students}
                </p>
              </div>

              <p className="text-gray-700 text-sm mb-4">{program.description}</p>

              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Edit Program
                </button>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View Courses
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
