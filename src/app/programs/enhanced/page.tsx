"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function EnhancedProgramManagementPage() {
  return (
    <section className="p-3 max-w-screen-xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Enhanced Program Management</h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive TVET program management with certification pathways
        </p>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {[
          { title: "Total Programs", value: 0 },
          { title: "Certifications", value: 0 },
          { title: "Modules", value: 0 },
          { title: "Avg Modules", value: 0 },
          { title: "Active", value: 0 },
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-md border p-2 text-center bg-white shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{item.title}</p>
            <p className="font-bold text-base">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-center">
        <Input placeholder="Search programs..." className="w-full sm:w-48" />
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Program Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Program Types</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All NQF Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All NQF Levels</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/programs/create">
          <Button className="flex items-center space-x-1 bg-primary">
            <PlusCircle className="w-4 h-4" />
            <span>Create</span>
          </Button>
        </Link>
      </div>

      {/* Program Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              {[
                "Program Details",
                "Configuration",
                "Modules & Outcomes",
                "Certifications",
                "Status",
                "Actions",
              ].map((head, idx) => (
                <th key={idx} className="px-3 py-2 whitespace-nowrap">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center py-4">
                No programs found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
