
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/types/database';
import { toast } from 'sonner';

interface UseActivityLogsOptions {
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  autoFetch?: boolean;
}

export function useActivityLogs(options: UseActivityLogsOptions = {}) {
  const { limit = 100, userId, action, entityType, autoFetch = true } = options;
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (userId) params.append('user_id', userId);
      if (action) params.append('action', action);
      if (entityType) params.append('entity_type', entityType);
      
      const { data, error } = await supabase.functions.invoke('get-activity-logs', {
        body: { limit, userId, action, entityType }
      });

      if (error) throw new Error(error.message);
      
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activity logs'));
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const logActivity = async (action: string, entityType: string, entityId: string, details?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('log-activity', {
        body: {
          action,
          entity_type: entityType,
          entity_id: entityId,
          details
        }
      });

      if (error) throw new Error(error.message);
      
      // Optionally refresh the logs
      await fetchLogs();
      
      return data;
    } catch (err) {
      console.error('Error logging activity:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchLogs();
    }
  }, [userId, action, entityType, limit, autoFetch]);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    logActivity
  };
}
