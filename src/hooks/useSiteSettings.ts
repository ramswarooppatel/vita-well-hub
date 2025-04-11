
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteSetting } from '@/types/database';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add isLoading alias for consistency with other hooks
  const isLoading = loading;

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Use the from method instead of .url
      const { data, error } = await supabase.from('site_settings').select('*');

      if (error) throw error;
      setSettings(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings');
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
      
      // Update local state
      setSettings(prev => 
        prev.map(setting => 
          setting.setting_key === key 
            ? { ...setting, setting_value: value } 
            : setting
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error updating site setting:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, isLoading, fetchSettings, updateSetting };
}
