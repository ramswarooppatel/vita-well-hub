
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UsersByRoleData, AppointmentStatusData, TestCategoryData } from '@/types/database';
import { toast } from 'sonner';

export function useUserRoleStats() {
  const [data, setData] = useState<UsersByRoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('get-users-by-role');
      
      if (error) throw new Error(error.message);
      
      setData(data || []);
    } catch (err) {
      console.error('Error fetching user role stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user role stats'));
      toast.error('Failed to load user statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

export function useAppointmentStatusStats() {
  const [data, setData] = useState<AppointmentStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('get-appointment-status-counts');
      
      if (error) throw new Error(error.message);
      
      setData(data || []);
    } catch (err) {
      console.error('Error fetching appointment status stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointment status stats'));
      toast.error('Failed to load appointment statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

export function useTestCategoryStats() {
  const [data, setData] = useState<TestCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('get-test-category-counts');
      
      if (error) throw new Error(error.message);
      
      setData(data || []);
    } catch (err) {
      console.error('Error fetching test category stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch test category stats'));
      toast.error('Failed to load test statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}
