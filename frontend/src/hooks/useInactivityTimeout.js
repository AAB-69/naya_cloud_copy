import { useState, useEffect, useRef, useCallback } from 'react';

// ==============================================================================
// ⏱️ SUPERVISOR TIMEOUT CONFIGURATION (MANUAL EDIT SECTION)
// ==============================================================================
// You can manually change the default timeout below:
// - Set to 2 for a 2-minute timeout
// - Set to 5 for a 5-minute timeout
// - Set to 0.166 for 10 seconds (instant test)
export const DEFAULT_TIMEOUT_MINUTES = 2;
// ==============================================================================

export function useInactivityTimeout(onTimeout, initialMinutes = DEFAULT_TIMEOUT_MINUTES) {
  const [timeoutSeconds, setTimeoutSeconds] = useState(Math.round(initialMinutes * 60));
  const [secondsRemaining, setSecondsRemaining] = useState(Math.round(initialMinutes * 60));
  const [isWarningActive, setIsWarningActive] = useState(false);

  // Stable ref for onTimeout callback
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const timerFiredRef = useRef(false);

  // Change timeout duration dynamically (from dropdown in header)
  const changeTimeoutDuration = useCallback((minutes) => {
    const secs = Math.max(5, Math.round(minutes * 60));
    setTimeoutSeconds(secs);
    setSecondsRemaining(secs);
    timerFiredRef.current = false;
    setIsWarningActive(false);
  }, []);

  // Manual reset function (only called if explicitly triggered by the user)
  const resetTimer = useCallback(() => {
    setSecondsRemaining(timeoutSeconds);
    timerFiredRef.current = false;
    setIsWarningActive(false);
  }, [timeoutSeconds]);

  useEffect(() => {
    const startTime = Date.now();
    timerFiredRef.current = false;
    setSecondsRemaining(timeoutSeconds);

    // Continuous 1-second interval counting down to session logout
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsed);
      setSecondsRemaining(remaining);

      // Warning when 20 seconds or less remain
      if (remaining <= 20 && remaining > 0) {
        setIsWarningActive(true);
      } else {
        setIsWarningActive(false);
      }

      // Session expired!
      if (remaining <= 0 && !timerFiredRef.current) {
        timerFiredRef.current = true;
        clearInterval(interval);
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timeoutSeconds]);

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return {
    timeoutMinutes: timeoutSeconds / 60,
    secondsRemaining,
    formattedTime: formatTime(secondsRemaining),
    isWarningActive,
    resetTimer,
    changeTimeoutDuration,
  };
}
