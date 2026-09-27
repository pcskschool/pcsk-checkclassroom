"use client";

import React from "react";
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout";
import { InactivityModal } from "@/components/core/inactivity-modal";

interface InactivityTrackerProps {
  timeoutMinutes?: number;
  enabled?: boolean;
}

/**
 * Portal Core Inactivity Tracker component.
 * Mounts globally in the authenticated application layout.
 * Enforces session inactivity policy without requiring system modules to implement any timeout logic.
 */
export function InactivityTracker({
  timeoutMinutes = 30,
  enabled = true,
}: InactivityTrackerProps) {
  const {
    isWarningOpen,
    formattedCountdown,
    extendSession,
    signOutNow,
  } = useInactivityTimeout({
    timeoutMinutes,
    enabled,
  });

  return (
    <InactivityModal
      isOpen={isWarningOpen}
      formattedCountdown={formattedCountdown}
      onExtend={extendSession}
      onSignOut={signOutNow}
    />
  );
}
