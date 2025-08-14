"use client";

import { useState } from "react";
import { Search, DollarSign, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

export default function FeeManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const feeStructure = [
    {
      program: "Diploma in Electrical Engineering",
      semesterFee: 2500,
      applicationFee: 100,
      materialsFee: 300,
      labFee: 200
    },
    {
      program: "Certificate in Automotive Technology",
      semesterFee: 2000,
      applicationFee: 100,
      materialsFee: 250,
      labFee: 150
    },
    {
      program: "Diploma in Business Management",
      semesterFee: 2200,
      applicationFee: 100,
      materialsFee: 150,
      labFee: 0
    },
    {
      program: "Certificate in Community Health",
      semesterFee: 1800,
      applicationFee: 100,
      materialsFee: 200,
      labFee: 100
    }
  ];

  const studentPayments = [
    {
      id: 1,
      studentId: "NPI2024001",
      studentName: "James Pokana",
      program: "Diploma in Electrical Engineering",
      semester: 3,
      totalDue: 3100,
      amountPaid: 2800,
      balance: 300,
      status: "partial",
      lastPayment: "2024-08-10",
      paymentMethod: "Bank Transfer"
    },
    {
      id: 2,
      studentId: "NPI2024002",
      studentName: "Sarah Mendi",
      program: "Diploma in Business Management",
      semester: 5,
      totalDue: 2450,
      amountPaid: 2450,
      balance: 0,
      status: "paid",
      lastPayment: "2024-08-01",
      paymentMethod: "Cash"
    },
    {
      id: 3,
      studentId: "NPI2024003",
      studentName: "Michael Temu",
      program: "Certificate in Automotive Technology",
      semester: 2,
      totalDue: 2500,
      amountPaid: 1000,
      balance: 1500,
      status: "overdue",
      lastPayment: "2024-07-15",
      paymentMethod: "Bank Transfer"
    },
    {
      id: 4,
      studentId: "NPI2024005",
      studentName: "Peter Namaliu",
      program: "Diploma in Agriculture Technology",
      semester: 1,
      totalDue: 2800,
      amountPaid: 0,
      balance: 2800,
      status: "unpaid",
      lastPayment: null,
      paymentMethod: null
    }
  ];

  const filteredPayments = studentPayments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "partial": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "unpaid": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle size={16} className="text-green-600" />;
      case "partial": return <AlertCircle size={16} className="text-yellow-600" />;
      case "overdue": return <AlertCircle size={16} className="text-red-600" />;
      case "unpaid": return <AlertCircle size={16} className="text-gray-600" />;
      default: return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const totalRevenue = studentPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const totalOutstanding = studentPayments.reduce((sum, payment) => sum + payment.balance, 0);
  const totalDue = studentPayments.reduce((sum, payment) => sum + payment.totalDue, 0);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <CreditCard size={16} />
              Record Payment
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Generate Invoices
            </button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-600" size={24} />
              <h3 className="font-semibold text-green-800">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">K{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-700 mt-1">Collected this semester</p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="font-semibold text-red-800">Outstanding</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">K{totalOutstanding.toLocaleString()}</p>
            <p className="text-sm text-red-700 mt-1">Pending payments</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-blue-600" size={24} />
              <h3 className="font-semibold text-blue-800">Total Expected</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">K{totalDue.toLocaleString()}</p>
            <p className="text-sm text-blue-700 mt-1">This semester</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-purple-600" size={24} />
              <h3 className="font-semibold text-purple-800">Collection Rate</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {((totalRevenue / totalDue) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-purple-700 mt-1">Payment completion</p>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Fee Structure (PGK)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">Program</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Semester Fee</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Application Fee</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Materials Fee</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Lab Fee</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {feeStructure.map((fee, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{fee.program}</td>
                    <td className="p-3">K{fee.semesterFee.toLocaleString()}</td>
                    <td className="p-3">K{fee.applicationFee.toLocaleString()}</td>
                    <td className="p-3">K{fee.materialsFee.toLocaleString()}</td>
                    <td className="p-3">K{fee.labFee.toLocaleString()}</td>
                    <td className="p-3 font-semibold">
                      K{(fee.semesterFee + fee.applicationFee + fee.materialsFee + fee.labFee).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Payments */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Student Payment Status</h2>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Program</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Total Due</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Amount Paid</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Balance</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Last Payment</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-800">{payment.studentName}</div>
                        <div className="text-sm text-gray-600">{payment.studentId}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">{payment.program}</div>
                      <div className="text-xs text-gray-600">Semester {payment.semester}</div>
                    </td>
                    <td className="p-4 font-semibold">K{payment.totalDue.toLocaleString()}</td>
                    <td className="p-4 text-green-600 font-semibold">K{payment.amountPaid.toLocaleString()}</td>
                    <td className="p-4 font-semibold text-red-600">
                      {payment.balance > 0 ? `K${payment.balance.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {payment.lastPayment ? (
                        <div>
                          <div className="text-sm">{payment.lastPayment}</div>
                          <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No payments</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Record Payment</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">Send Invoice</button>
                        <button className="text-purple-600 hover:text-purple-800 text-sm">Payment History</button>
                      </div>
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
