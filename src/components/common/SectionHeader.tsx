// src/components/common/SectionHeader.tsx
import React from "react";

type Props = { title: string; className?: string };

export default function SectionHeader({ title, className }: Props) {
  return (
    <div className={["my-6", className].filter(Boolean).join(" ")}>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {/* visible line under the title */}
      <div className="mt-3 h-[3px] w-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />
    </div>
  );
}
