"use client";

import { useState } from 'react';
import Link from 'next/link';
import { setupDatabase, checkDatabaseHealth, createAdminUser } from '@/lib/database-setup';
import { Database, Users, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [healthCheck, setHealthCheck] = useState<{success: boolean; checks?: Array<{table: string; status: string; count?: number | null; error?: string}>} | null>(null);
  const [adminCreated, setAdminCreated] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [adminForm, setAdminForm] = useState({
    email: 'admin@npi.edu.pg',
    password: 'admin123456',
    fullName: 'System Administrator'
  });

  const handleDatabaseSetup = async () => {
    setSetupStatus('checking');
    setError(null);

    try {
      // Test database connection
      const setupResult = await setupDatabase();

      if (setupResult.success) {
        // Check database health
        const healthResult = await checkDatabaseHealth();
        setHealthCheck(healthResult);
        setSetupStatus('success');
      } else {
        setError(setupResult.error || 'Database setup failed');
        setSetupStatus('error');
      }
    } catch (err) {
      setError((err as Error).message);
      setSetupStatus('error');
    }
  };

  const handleCreateAdmin = async () => {
    setIsCreatingAdmin(true);
    setError(null);

    try {
      const result = await createAdminUser(
        adminForm.email,
        adminForm.password,
        adminForm.fullName
      );

      if (result.success) {
        setAdminCreated(true);
      } else {
        setError(result.error || 'Failed to create admin user');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              NPI TVET Database Setup
            </h1>
            <p className="text-gray-600">
              Initialize your Supabase database for the TVET Academic Management System
            </p>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">Setup Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Open your Supabase dashboard at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">supabase.com/dashboard</a></li>
              <li>Navigate to your project: <strong>gomfaspdusmdqkfzhdfk</strong></li>
              <li>Go to <strong>SQL Editor</strong> in the left sidebar</li>
              <li>Create a new query and paste the contents of <code>supabase-schema.sql</code></li>
              <li>Run the SQL script to create all tables and initial data</li>
              <li>Return here to test the connection and create an admin user</li>
            </ol>
          </div>

          {/* Database Connection Test */}
          <div className="border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Database Connection</h3>
              </div>
              <button
                onClick={handleDatabaseSetup}
                disabled={setupStatus === 'checking'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {setupStatus === 'checking' ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Checking...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>

            {setupStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle size={16} />
                  <span className="font-medium">Database connection successful!</span>
                </div>
              </div>
            )}

            {setupStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle size={16} />
                  <span className="font-medium">Connection failed: {error}</span>
                </div>
              </div>
            )}

            {healthCheck && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Database Health Check:</h4>
                <div className="space-y-2">
                  {healthCheck.checks?.map((check, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{check.table}</span>
                      <div className="flex items-center gap-2">
                        {check.status === 'ok' ? (
                          <>
                            <CheckCircle className="text-green-600" size={16} />
                            <span className="text-green-600">OK ({check.count} records)</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="text-red-600" size={16} />
                            <span className="text-red-600">Error</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin User Creation */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Create Admin User</h3>
            </div>

            {!adminCreated ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={adminForm.fullName}
                      onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters. You can change this later.
                  </p>
                </div>
                <button
                  onClick={handleCreateAdmin}
                  disabled={isCreatingAdmin || setupStatus !== 'success'}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreatingAdmin ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Creating...
                    </>
                  ) : (
                    'Create Admin User'
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle size={16} />
                  <span className="font-medium">Admin user created successfully!</span>
                </div>
                <p className="text-green-700 mt-2 text-sm">
                  You can now log in to the system with your admin credentials.
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          {setupStatus === 'success' && (
            <div className="bg-gray-50 border rounded-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Next Steps</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>Database connection established</span>
                </li>
                <li className="flex items-center gap-2">
                  {adminCreated ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <AlertCircle className="text-yellow-600" size={16} />
                  )}
                  <span>Admin user {adminCreated ? 'created' : 'pending'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="text-blue-600" size={16} />
                  <span>Return to <Link href="/" className="text-blue-600 hover:underline">main dashboard</Link> to start using the system</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
