"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UseInactivityTimeoutOptions {
  timeoutMinutes?: number;
  warningDurationMs?: number; // e.g. 2 minutes = 120,000ms
  enabled?: boolean;
}

const STORAGE_KEY = "pcsk_portal_last_active";

export function useInactivityTimeout({
  timeoutMinutes = 30,
  warningDurationMs = 2 * 60 * 1000,
  enabled = true,
}: UseInactivityTimeoutOptions = {}) {
  const router = useRouter();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const lastThrottleRef = useRef<number>(Date.now());

  // Record active timestamp in localStorage to sync across browser tabs
  const recordActivity = useCallback(() => {
    const now = Date.now();
    // Throttle writing to localStorage to once every 5 seconds
    if (now - lastThrottleRef.current > 5000) {
      lastThrottleRef.current = now;
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {
        // Storage might fail in private browsing
      }
    }
    // If warning was open and user interacts, we can either keep modal open or let user extend manually
  }, []);

  // Handle explicit extend session action
  const extendSession = useCallback(() => {
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {}
    setIsWarningOpen(false);
  }, []);

  // Handle sign out
  const handleLogout = useCallback(async (reason: "timeout" | "manual" = "timeout") => {
    setIsWarningOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore client error
    }
    router.push(`/login?reason=${reason}`);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!enabled) return;

    // Initialize timestamp if absent
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    // Activity event listeners
    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];
    const handleUserActivity = () => {
      recordActivity();
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    // Listen to changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setIsWarningOpen(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Heartbeat ticker running every 1 second
    const interval = setInterval(() => {
      const storedTime = localStorage.getItem(STORAGE_KEY);
      const lastActive = storedTime ? parseInt(storedTime, 10) : Date.now();
      const elapsed = Date.now() - lastActive;
      const remainingMs = timeoutMs - elapsed;

      if (remainingMs <= 0) {
        // Timeout reached!
        clearInterval(interval);
        handleLogout("timeout");
      } else if (remainingMs <= warningDurationMs) {
        // Warning threshold reached
        setIsWarningOpen(true);
        setSecondsRemaining(Math.ceil(remainingMs / 1000));
      } else {
        setIsWarningOpen(false);
      }
    }, 1000);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [enabled, timeoutMs, warningDurationMs, recordActivity, handleLogout]);

  // Format seconds into MM:SS
  const formatCountdown = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isWarningOpen,
    secondsRemaining,
    formattedCountdown: formatCountdown(secondsRemaining),
    extendSession,
    signOutNow: () => handleLogout("manual"),
  };
}
