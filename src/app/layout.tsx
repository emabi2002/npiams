import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "(NPIAMS) National Polytechnic Institute Academic Management System",
  description:
    "Comprehensive academic management platform for courses, programs, assessments, and grades",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Helper to handle external vs internal links
  const renderLink = (href: string, label: string) => {
    const isExternal = href.startsWith("http");
    return (
      <a
        href={href}
        className="block pl-4 hover:text-yellow-300"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* Removed global Script that caused runtime SyntaxError */}
      <head />
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="bg-gradient-to-r from-black via-blue-700 to-red-600 shadow p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Image
                  src="/images/npi-logo.png"
                  alt="NPIPNG Logo"
                  width={40}
                  height={40}
                />
                <span className="text-xl font-bold text-white">
                  (NPIAMS) National Polytechnic Institute Academic Management System
                </span>
              </div>
              <div className="relative">
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Menu ▾
                </button>
                {/* Dropdown Menu Placeholder */}
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg hidden">
                  <a
                    href="#"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Module 1
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Module 2
                  </a>
                </div>
              </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <aside className="w-64 bg-gradient-to-b from-black via-blue-700 to-red-600 text-white p-4 shadow-md overflow-y-auto">
                <nav className="space-y-2 text-sm">
                  {/* === AMS HEADER (bright blue) === */}
                  <div className="px-2 mt-1">
                    <span
                      className="inline-flex items-center gap-2 rounded-md
                                 bg-gradient-to-r from-sky-400 to-blue-600
                                 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white
                                 shadow-md ring-1 ring-white/20"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                      Academic Management System
                    </span>
                    <div
                      className="mt-2 h-[3px] w-full rounded-full
                                 bg-gradient-to-r from-sky-400/80 via-blue-400/80 to-sky-400/80"
                    />
                  </div>

                  {/* --- Existing AMS groups --- */}
                  <div className="font-bold mt-4">Academic Setup</div>
                  {renderLink("/academic-calendar", "Academic Years")}
                  {renderLink("/departments", "Departments")}
                  {renderLink("/programs", "Programs")}
                  {renderLink("/courses", "Courses")}

                  <div className="font-bold mt-4">Student Management</div>
                  {renderLink("/student-profiles", "Student Profiles")}
                  {renderLink("/users/enhanced", "User Management")}

                  <div className="font-bold mt-4">Fee Management</div>
                  {renderLink("/fee-management", "Fee Management")}

                  <div className="font-bold mt-4">Assessment & Exams</div>
                  {renderLink("/create-assessments", "Create Assessments")}
                  {renderLink("/student-grades", "Grade Management")}

                  <div className="font-bold mt-4">Instructor Management</div>
                  {renderLink("/instructor-management", "Instructor Management")}

                  <div className="font-bold mt-4">Reports & Analytics</div>
                  {renderLink("/analytics-dashboard", "Analytics Dashboard")}

                  {/* Divider */}
                  <div
                    className="my-5 mx-1 h-[3px] w-[95%] rounded-full
                               bg-gradient-to-r from-transparent via-white/70 to-transparent"
                  />

                  {/* === SRS HEADER (magenta→red) === */}
                  <div className="px-2">
                    <span
                      className="inline-flex items-center gap-2 rounded-md
                                 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-red-500
                                 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white
                                 shadow-md ring-1 ring-white/20"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                      Students Registration System
                    </span>
                    <div
                      className="mt-2 h-[3px] w-full rounded-full
                                 bg-gradient-to-r from-fuchsia-400/80 via-rose-400/80 to-red-400/80"
                    />
                  </div>

                  {/* SRS links */}
                  {renderLink("/admissions/apply", "New Applications")}
                  {renderLink("/admissions/admin", "Review Applications")}
                  {renderLink("/admissions/status", "Enrollment Tracking")}
                </nav>
              </aside>

              {/* Main Content */}
              <main className="flex-1 p-6 overflow-y-auto bg-white text-gray-900 text-sm">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
