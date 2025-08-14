"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { setupDatabase, checkDatabaseHealth, createAdminUser } from '@/lib/database-setup';
import { Database, Upload, Download, Users, CheckCircle, AlertCircle, Loader, RefreshCw, FileText } from 'lucide-react';

export default function DatabaseAdminPage() {
  const [activeTab, setActiveTab] = useState('setup');
  const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [healthCheck, setHealthCheck] = useState<{success: boolean; checks?: Array<{table: string; status: string; count?: number | null; error?: string}>} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [importData, setImportData] = useState({
    departments: '',
    programs: '',
    courses: '',
    students: ''
  });

  const sqlSchema = `-- Copy this entire SQL script to your Supabase SQL Editor
-- NPI TVET Academic Management System Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'instructor', 'student');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE student_status AS ENUM ('active', 'graduated', 'suspended', 'withdrawn');
CREATE TYPE assessment_type AS ENUM ('exam', 'assignment', 'project', 'quiz');
CREATE TYPE assessment_status AS ENUM ('draft', 'scheduled', 'active', 'completed', 'graded');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'overdue');

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone TEXT,
    address TEXT,
    province TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    head_name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continue with rest of schema... (truncated for display)
-- Please copy the complete schema from supabase-schema.sql file`;

  const handleDatabaseTest = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const setupResult = await setupDatabase();

      if (setupResult.success) {
        const healthResult = await checkDatabaseHealth();
        setHealthCheck(healthResult);
        setSetupStatus('success');
        setMessage('Database connection successful!');
      } else {
        setError(setupResult.error || 'Database connection failed');
        setSetupStatus('error');
      }
    } catch (err) {
      setError((err as Error).message);
      setSetupStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await createAdminUser(
        'admin@npi.edu.pg',
        'admin123456',
        'System Administrator'
      );

      if (result.success) {
        setMessage('Admin user created successfully!');
      } else {
        setError(result.error || 'Failed to create admin user');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkImport = async (dataType: string) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = importData[dataType as keyof typeof importData];
      if (!data.trim()) {
        setError('Please enter data to import');
        return;
      }

      const jsonData = JSON.parse(data);

      const { error: insertError } = await supabase
        .from(dataType)
        .insert(jsonData);

      if (insertError) {
        setError(`Import failed: ${insertError.message}`);
      } else {
        setMessage(`Successfully imported ${jsonData.length} ${dataType} records`);
        setImportData({ ...importData, [dataType]: '' });
      }
    } catch (err) {
      setError(`Invalid JSON format: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('SQL schema copied to clipboard!');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Database Administration</h1>
          <p className="text-gray-600">Manage your Supabase database setup and data import</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'setup', name: 'Database Setup', icon: Database },
              { id: 'import', name: 'Data Import', icon: Upload },
              { id: 'export', name: 'Data Export', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={16} />
              <span>{message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Database Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Setup Instructions</h3>
              <ol className="list-decimal list-inside space-y-3 text-blue-700">
                <li>
                  <strong>Access Supabase Dashboard:</strong>{' '}
                  <a
                    href="https://supabase.com/dashboard/project/gomfaspdusmdqkfzhdfk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    Open your project dashboard
                  </a>
                </li>
                <li><strong>Go to SQL Editor:</strong> Click "SQL Editor" in the left sidebar</li>
                <li><strong>Create New Query:</strong> Click "New Query" button</li>
                <li><strong>Copy Schema:</strong> Use the button below to copy the complete SQL schema</li>
                <li><strong>Run Script:</strong> Paste and execute the SQL to create all tables</li>
                <li><strong>Test Connection:</strong> Return here and test the database connection</li>
              </ol>
            </div>

            {/* SQL Schema */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">SQL Schema</h3>
                <button
                  onClick={() => copyToClipboard(sqlSchema)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  Copy Schema
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{sqlSchema}</pre>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Note:</strong> Copy the complete schema from the <code>supabase-schema.sql</code> file in your project.
              </p>
            </div>

            {/* Connection Test */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Test Database Connection</h3>
                <button
                  onClick={handleDatabaseTest}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Test Connection
                    </>
                  )}
                </button>
              </div>

              {healthCheck && healthCheck.checks && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Database Tables Status:</h4>
                  {healthCheck.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                      <span className="text-gray-700">{check.table}</span>
                      <div className="flex items-center gap-2">
                        {check.status === 'ok' ? (
                          <>
                            <CheckCircle className="text-green-600" size={16} />
                            <span className="text-green-600">OK ({check.count} records)</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="text-red-600" size={16} />
                            <span className="text-red-600">Error: {check.error}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Admin User */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Create Admin User</h3>
                  <p className="text-sm text-gray-600">Create your first administrator account</p>
                </div>
                <button
                  onClick={handleCreateAdmin}
                  disabled={isLoading || setupStatus !== 'success'}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      Create Admin
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Default Admin Credentials:</strong><br />
                  Email: admin@npi.edu.pg<br />
                  Password: admin123456<br />
                  <em>You can change these after first login</em>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Ensure your database is set up before importing data. Data should be in JSON format as an array of objects.
              </p>
            </div>

            {['departments', 'programs', 'courses', 'students'].map((dataType) => (
              <div key={dataType} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">{dataType} Import</h3>
                  <button
                    onClick={() => handleBulkImport(dataType)}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Import {dataType}
                  </button>
                </div>
                <textarea
                  value={importData[dataType as keyof typeof importData]}
                  onChange={(e) => setImportData({ ...importData, [dataType]: e.target.value })}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={`Paste your ${dataType} JSON data here...`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: {`[{"name": "Example", "code": "EX"}, ...]`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Data Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Data</h3>
              <p className="text-gray-600 mb-4">
                Export your academic data for backup or transfer to other systems.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['All Data', 'Students Only', 'Academic Structure', 'Financial Records'].map((exportType) => (
                  <button
                    key={exportType}
                    className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-800">{exportType}</div>
                    <div className="text-sm text-gray-600">Export {exportType.toLowerCase()}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
