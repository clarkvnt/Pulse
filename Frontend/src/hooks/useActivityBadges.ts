import { useState, useEffect, useRef } from 'react';
import { activityApi } from '../lib/api';

interface ActivityBadges {
  team: number;
  projects: number;
  activity: number;
}

const POLL_INTERVAL = 30000; // Poll every 30 seconds
const RECENT_ACTIVITY_WINDOW = 5 * 60 * 1000; // Activities from last 5 minutes

export function useActivityBadges(enabled: boolean = true) {
  const [badges, setBadges] = useState<ActivityBadges>({
    team: 0,
    projects: 0,
    activity: 0,
  });
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActivityBadges = async () => {
    if (!enabled) return;

    try {
      const response = await activityApi.getAll({ limit: 100 });
      
      if (response.success && response.data) {
        const data = response.data as any;
        // Handle paginated response: { activities: [], pagination: {} }
        // Or direct array response
        const activitiesList = Array.isArray(data) 
          ? data 
          : (data.activities || (data.data && Array.isArray(data.data) ? data.data : []));
        const now = Date.now();

        // Filter activities from the last 5 minutes
        const recentActivities = activitiesList.filter((activity: any) => {
          const activityTime = new Date(activity.createdAt).getTime();
          return now - activityTime <= RECENT_ACTIVITY_WINDOW;
        });

        // Count activities by type
        const counts: ActivityBadges = {
          team: 0,
          projects: 0,
          activity: recentActivities.length,
        };

        recentActivities.forEach((activity: any) => {
          const type = activity.type?.toLowerCase() || '';
          if (type.includes('team') || type.includes('member')) {
            counts.team++;
          }
          if (type.includes('project')) {
            counts.projects++;
          }
        });

        setBadges(counts);
        setLastCheckTime(now);
      }
    } catch (error) {
      console.error('Failed to fetch activity badges:', error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset badges
      setBadges({ team: 0, projects: 0, activity: 0 });
      return;
    }

    // Initial fetch
    fetchActivityBadges();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchActivityBadges();
    }, POLL_INTERVAL);

    // Cleanup on unmount or when disabled
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);

  return { badges, lastCheckTime };
}

