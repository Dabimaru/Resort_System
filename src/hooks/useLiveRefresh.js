import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL_MS = 30_000;

export default function useLiveRefresh(refresh, {
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
} = {}) {
  const refreshRef = useRef(refresh);
  const inFlightRef = useRef(false);

  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const runRefresh = async () => {
      if (document.visibilityState === 'hidden' || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      try {
        await refreshRef.current();
      } catch (error) {
        console.error('Unable to refresh live data.', error);
      } finally {
        inFlightRef.current = false;
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        runRefresh();
      }
    };

    const interval = window.setInterval(runRefresh, intervalMs);
    window.addEventListener('focus', runRefresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', runRefresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [enabled, intervalMs]);
}
