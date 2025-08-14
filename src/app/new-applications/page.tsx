export default function NewApplicationsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">New Applications</h1>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Review and process new student applications for TVET programs.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add New Application
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Application ID</th>
                  <th className="text-left p-3 font-semibold">Student Name</th>
                  <th className="text-left p-3 font-semibold">Program Applied</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Date Applied</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">#APP-2024-001</td>
                  <td className="p-3">James Pokana</td>
                  <td className="p-3">Electrical Engineering</td>
                  <td className="p-3">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Pending
                    </span>
                  </td>
                  <td className="p-3">2024-01-15</td>
                  <td className="p-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Review</button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">#APP-2024-002</td>
                  <td className="p-3">Sarah Mendi</td>
                  <td className="p-3">Business Management</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Approved
                    </span>
                  </td>
                  <td className="p-3">2024-01-14</td>
                  <td className="p-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">#APP-2024-003</td>
                  <td className="p-3">Michael Temu</td>
                  <td className="p-3">Agriculture Technology</td>
                  <td className="p-3">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Under Review
                    </span>
                  </td>
                  <td className="p-3">2024-01-13</td>
                  <td className="p-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
