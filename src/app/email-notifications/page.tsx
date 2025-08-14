"use client";

import { useState } from 'react';
import { Mail, Send, Settings, Users, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { emailService, NotificationType } from '@/lib/email-service';

export default function EmailNotificationsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [emailConfig, setEmailConfig] = useState({
    provider: 'supabase',
    fromEmail: 'noreply@npi.edu.pg',
    fromName: 'National Polytechnic Institute',
    replyTo: 'info@npi.edu.pg',
    apiKey: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: ''
  });

  const [testEmail, setTestEmail] = useState({
    to: 'test@example.com',
    type: 'application_received' as NotificationType,
    studentName: 'John Doe',
    programName: 'Diploma in Electrical Engineering',
    applicationId: 'APP-2024-001'
  });

  const [emailStats] = useState({
    sent: 156,
    delivered: 152,
    opened: 98,
    clicked: 34,
    bounced: 4,
    failed: 0
  });

  const [recentEmails] = useState([
    {
      id: 1,
      type: 'application_received',
      to: 'james.pokana@student.npi.edu.pg',
      subject: 'Application Received - Electrical Engineering',
      status: 'delivered',
      sentAt: '2024-08-14 10:30 AM'
    },
    {
      id: 2,
      type: 'grade_released',
      to: 'sarah.mendi@student.npi.edu.pg',
      subject: 'Grades Released - Business Management',
      status: 'opened',
      sentAt: '2024-08-14 09:15 AM'
    },
    {
      id: 3,
      type: 'fee_reminder',
      to: 'michael.temu@student.npi.edu.pg',
      subject: 'Fee Payment Reminder - Semester 2',
      status: 'sent',
      sentAt: '2024-08-14 08:45 AM'
    }
  ]);

  const emailTypes = [
    { id: 'application_received', name: 'Application Received', description: 'Sent when student submits application' },
    { id: 'application_approved', name: 'Application Approved', description: 'Sent when application is approved' },
    { id: 'application_rejected', name: 'Application Rejected', description: 'Sent when application is rejected' },
    { id: 'grade_released', name: 'Grade Released', description: 'Sent when grades are published' },
    { id: 'fee_reminder', name: 'Fee Reminder', description: 'Sent for fee payment reminders' },
    { id: 'enrollment_complete', name: 'Enrollment Complete', description: 'Sent when enrollment is finalized' },
    { id: 'assessment_scheduled', name: 'Assessment Scheduled', description: 'Sent when assessments are scheduled' },
    { id: 'transcript_ready', name: 'Transcript Ready', description: 'Sent when transcript is available' }
  ];

  const handleSaveConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Save email configuration
      localStorage.setItem('npi_email_config', JSON.stringify(emailConfig));
      setMessage('Email configuration saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await emailService.sendApplicationReceived(testEmail.to, {
        studentName: testEmail.studentName,
        programName: testEmail.programName,
        applicationId: testEmail.applicationId,
        dateSubmitted: new Date().toLocaleDateString(),
        portalUrl: 'https://same-lu5vy9sqhdz-latest.netlify.app'
      });

      if (success) {
        setMessage('Test email sent successfully!');
      } else {
        setError('Failed to send test email');
      }
    } catch (err) {
      setError('Error sending test email');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="text-green-600" size={16} />;
      case 'opened': return <Mail className="text-blue-600" size={16} />;
      case 'sent': return <Clock className="text-yellow-600" size={16} />;
      case 'failed': return <AlertCircle className="text-red-600" size={16} />;
      default: return <Clock className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Notifications</h1>
          <p className="text-gray-600">Manage email communications and notifications for students and staff</p>
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Mail },
              { id: 'templates', name: 'Templates', icon: FileText },
              { id: 'settings', name: 'Settings', icon: Settings },
              { id: 'test', name: 'Test Email', icon: Send }
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Email Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Sent', value: emailStats.sent, color: 'blue' },
                { label: 'Delivered', value: emailStats.delivered, color: 'green' },
                { label: 'Opened', value: emailStats.opened, color: 'purple' },
                { label: 'Clicked', value: emailStats.clicked, color: 'indigo' },
                { label: 'Bounced', value: emailStats.bounced, color: 'yellow' },
                { label: 'Failed', value: emailStats.failed, color: 'red' }
              ].map((stat, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Emails */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Email Activity</h3>
              <div className="space-y-3">
                {recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(email.status)}
                      <div>
                        <div className="font-medium text-gray-800">{email.subject}</div>
                        <div className="text-sm text-gray-600">To: {email.to}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{email.sentAt}</div>
                      <div className={`text-xs font-medium capitalize ${
                        email.status === 'delivered' ? 'text-green-600' :
                        email.status === 'opened' ? 'text-blue-600' :
                        email.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {email.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Email templates are pre-configured with professional designs.
                You can customize the content and styling through the system settings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emailTypes.map((emailType) => (
                <div key={emailType.id} className="bg-white border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{emailType.name}</h3>
                      <p className="text-sm text-gray-600">{emailType.description}</p>
                    </div>
                    <Mail className="text-gray-400" size={20} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Subject:</span>{' '}
                      <span className="font-medium">Dynamic based on content</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Format:</span>{' '}
                      <span className="font-medium">HTML + Plain Text</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Personalization:</span>{' '}
                      <span className="font-medium">Student name, program, etc.</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Preview Template
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Edit Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Provider Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                  <select
                    value={emailConfig.provider}
                    onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="supabase">Supabase Edge Functions</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="resend">Resend</option>
                    <option value="smtp">SMTP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={emailConfig.fromName}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reply To</label>
                  <input
                    type="email"
                    value={emailConfig.replyTo}
                    onChange={(e) => setEmailConfig({ ...emailConfig, replyTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {emailConfig.provider !== 'smtp' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="password"
                      value={emailConfig.apiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your API key"
                    />
                  </div>
                )}

                {emailConfig.provider === 'smtp' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                      <input
                        type="text"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                      <input
                        type="number"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                      <input
                        type="text"
                        value={emailConfig.smtpUser}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                      <input
                        type="password"
                        value={emailConfig.smtpPass}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveConfig}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Email Tab */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Test Email</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="test@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
                  <select
                    value={testEmail.type}
                    onChange={(e) => setTestEmail({ ...testEmail, type: e.target.value as NotificationType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {emailTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    value={testEmail.studentName}
                    onChange={(e) => setTestEmail({ ...testEmail, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={testEmail.programName}
                    onChange={(e) => setTestEmail({ ...testEmail, programName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleTestEmail}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={16} />
                  {isLoading ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 border rounded-lg p-6">
              <h4 className="font-medium text-gray-800 mb-3">Email Preview</h4>
              <div className="bg-white border rounded p-4 text-sm">
                <div className="font-medium mb-2">Subject: Application Received - {testEmail.programName}</div>
                <div className="text-gray-600">
                  Dear {testEmail.studentName},<br/><br/>
                  Thank you for your application to {testEmail.programName} at the National Polytechnic Institute...<br/><br/>
                  <em>This is a preview of the email content.</em>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
