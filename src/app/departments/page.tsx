export default function DepartmentsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Departments</h1>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-600 mb-6">
            Manage academic departments and their administrative structure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Engineering & Technology</h3>
              <p className="text-gray-600 text-sm mb-2">Head: Dr. John Kila</p>
              <p className="text-gray-500 text-sm">Programs: 5 | Students: 423</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Business & Commerce</h3>
              <p className="text-gray-600 text-sm mb-2">Head: Ms. Mary Tau</p>
              <p className="text-gray-500 text-sm">Programs: 4 | Students: 312</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Agriculture & Applied Sciences</h3>
              <p className="text-gray-600 text-sm mb-2">Head: Dr. Peter Namaliu</p>
              <p className="text-gray-500 text-sm">Programs: 3 | Students: 287</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Health & Community Services</h3>
              <p className="text-gray-600 text-sm mb-2">Head: Sr. Grace Mondo</p>
              <p className="text-gray-500 text-sm">Programs: 3 | Students: 225</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
