
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteSetting } from '@/types/database';
import { toast } from 'sonner';

export function useSiteSettings(key?: string) {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [setting, setSetting] = useState<SiteSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true);
        setError(null);
        
        let url = `${supabase.functions.url}/get-site-settings`;
        if (key) {
          url += `?key=${encodeURIComponent(key)}`;
        }
        
        const { data, error } = await supabase.functions.invoke('get-site-settings', {
          body: key ? { key } : undefined
        });

        if (error) throw new Error(error.message);
        
        if (key && data) {
          setSetting(data);
        } else {
          setSettings(data || []);
        }
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch site settings'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [key]);

  const updateSetting = async (key: string, value: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-site-setting', {
        body: { key, value }
      });

      if (error) throw new Error(error.message);

      // Update the local state
      if (setting && setting.setting_key === key) {
        setSetting(data);
      }
      
      setSettings(prevSettings => 
        prevSettings.map(s => 
          s.setting_key === key ? data : s
        )
      );

      toast.success(`Setting "${key}" updated successfully`);
      return data;
    } catch (err) {
      console.error('Error updating site setting:', err);
      toast.error(`Failed to update setting: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  return {
    settings,
    setting: setting?.setting_value,
    isLoading,
    error,
    updateSetting
  };
}
