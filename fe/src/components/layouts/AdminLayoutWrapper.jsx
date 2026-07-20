"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { Menu, BrainCircuit } from "lucide-react";

export default function AdminLayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-base)">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-(--border-default) bg-(--bg-surface) px-5 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent) shadow-(--shadow-glow-accent)">
              <BrainCircuit size={16} className="text-(--bg-base)" />
            </div>
            <span className="text-base font-bold tracking-tight text-(--text-primary)">
              Transmotion
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl border border-(--border-default) bg-(--bg-elevated) p-2 text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary) focus:ring-2 focus:ring-(--accent-muted) focus:outline-none"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
