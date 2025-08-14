"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, LogOut, User } from "lucide-react";
// Authentication removed - using default admin user

interface MenuItem {
  label: string;
  href?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Academic Setup",
    children: [
      { label: "Academic Years", href: "/academic-years" },
      { label: "Departments", href: "/departments" },
      { label: "Programs", href: "/programs" },
      { label: "Courses", href: "/courses" },
    ],
  },
  {
    label: "Student Management",
    children: [
      { label: "New Applications", href: "/new-applications" },
      { label: "Student Profiles", href: "/student-profiles" },
      { label: "User Management", href: "/user-management" },
    ],
  },
  {
    label: "Fee Management",
    children: [
      { label: "Fee Management", href: "/fee-management" },
    ],
  },
  {
    label: "Assessment & Exams",
    children: [
      { label: "Create Assessments", href: "/create-assessments" },
      { label: "Grade Management", href: "/grade-management" },
    ],
  },
  {
    label: "Instructor Management",
    children: [
      { label: "Instructor Management", href: "/instructor-management" },
    ],
  },
  {
    label: "Reports & Analytics",
    children: [
      { label: "Analytics Dashboard", href: "/analytics-dashboard" },
    ],
  },
  {
    label: "System Administration",
    children: [
      { label: "Database Admin", href: "/database-admin" },
      { label: "Email Notifications", href: "/email-notifications" },
      { label: "Branding & Customization", href: "/branding" },
    ],
  },
];

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Academic Setup",
    "Student Management",
    "Assessment & Exams",
    "Reports & Analytics"
  ]);

  // Default admin user - no authentication required
  const displayUser = {
    full_name: 'System Administrator',
    role: 'admin' as const
  };

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionLabel)
        ? prev.filter(s => s !== sectionLabel)
        : [...prev, sectionLabel]
    );
  };

  const handleSignOut = () => {
    // No authentication - just reload page
    window.location.reload();
  };

  return (
    <div className="w-80 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center font-bold text-white">
            P
          </div>
          <div className="text-sm font-medium leading-tight">
            <div>(NPIAMS) National Polytechnic</div>
            <div>Institute Academic Management System</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      {displayUser && (
        <div className="p-4 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{displayUser.full_name}</div>
              <div className="text-xs text-purple-200 capitalize">{displayUser.role}</div>
              <div className="text-xs text-orange-200">Testing Mode</div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 hover:bg-purple-600/50 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {menuItems.map((section) => (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-purple-600/50 rounded-md transition-colors"
              >
                <span className="font-medium text-sm">{section.label}</span>
                {expandedSections.includes(section.label) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {expandedSections.includes(section.label) && section.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href || "#"}
                      className="block p-2 text-sm text-purple-100 hover:text-white hover:bg-purple-600/30 rounded-md transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* PWA Install Footer */}
      <div className="p-4 border-t border-purple-500/30">
        <div className="text-xs text-purple-200 text-center">
          <div className="mb-1">📱 Install as App</div>
          <div>For offline access & notifications</div>
        </div>
      </div>
    </div>
  );
}
