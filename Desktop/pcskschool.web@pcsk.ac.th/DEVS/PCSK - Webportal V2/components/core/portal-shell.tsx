"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Footer } from "./footer";
import { InactivityTracker } from "./inactivity-tracker";
import type { SystemRegistryItem, UserProfile } from "@/types/portal";

export interface PortalShellProps {
  userProfile?: UserProfile | null;
  systems: SystemRegistryItem[];
  timeoutMinutes?: number;
  footerText?: string;
  children: React.ReactNode;
}

/**
 * Master Portal Core Application Shell.
 * Unifies Sidebar, Topbar, Content Area, Inactivity Tracker, and Footer.
 */
export function PortalShell({
  userProfile,
  systems,
  timeoutMinutes = 30,
  footerText,
  children,
}: PortalShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Global Inactivity Tracker */}
      <InactivityTracker timeoutMinutes={timeoutMinutes} />

      {/* Main Layout Container */}
      <div className="flex flex-1 min-h-screen">
        {/* Left: Dynamic Database-Driven Sidebar */}
        <Sidebar
          systems={systems}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right: Main Content Area + Topbar + Footer */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            userProfile={userProfile}
            systems={systems}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />

          {/* Dynamic Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          {/* Persistent Core Footer */}
          <Footer footerText={footerText} />
        </div>
      </div>
    </div>
  );
}
