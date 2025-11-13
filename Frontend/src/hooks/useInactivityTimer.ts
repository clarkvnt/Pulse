import { useEffect, useRef, useCallback } from 'react';
import { authApi } from '../lib/api';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

export function useInactivityTimer(enabled: boolean = true, timeout: number = INACTIVITY_TIMEOUT) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set new timer
    timerRef.current = setTimeout(() => {
      // User has been inactive for the timeout period
      toast.warning('Session expired due to inactivity. Logging out...');
      authApi.logout();
      // Reload page to trigger AuthGuard to show login screen
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, timeout);
  }, [enabled, timeout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      // Clear timer if disabled
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Initialize timer on mount
    resetTimer();

    // Add event listeners for user activity
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Handle visibility change (user switches tabs/windows)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User came back to the tab, reset timer
        resetTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle window focus (user switches back to the window)
    const handleFocus = () => {
      resetTimer();
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup on unmount or when disabled
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, handleActivity, resetTimer]);

  // Return function to manually reset timer (useful for API calls)
  return {
    resetTimer,
    getLastActivity: () => lastActivityRef.current,
  };
}

