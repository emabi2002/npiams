export default function AcademicYearsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Academic Years</h1>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-600 mb-4">
            Manage academic years and session periods for the TVET institution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Current Academic Year</h3>
              <p className="text-blue-600">2024-2025</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Students</h3>
              <p className="text-green-600">1,247</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Active Programs</h3>
              <p className="text-purple-600">15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
