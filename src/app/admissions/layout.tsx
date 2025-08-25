// src/app/admissions/layout.tsx
import React from "react";
// DashboardLayout is the *default export* from src/app/dashboard/layout.tsx
import DashboardLayout from "@/app/dashboard/layout";

export default function AdmissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
