
import { supabase } from '@/integrations/supabase/client';
import { MedicalRecord } from '@/types/database';
import { toast } from 'sonner';

export async function fetchMedicalRecords(userId?: string) {
  try {
    let query = supabase
      .from('medical_records')
      .select('*');
      
    if (userId) {
      query = query.eq('user_id', userId);
    }
      
    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching medical records:', error);
    throw error;
  }
}

export async function createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    
    // Log activity
    await supabase.functions.invoke('log-activity', {
      body: {
        action: 'create',
        entity_type: 'medical_record',
        entity_id: data.id,
        details: { title: record.title }
      }
    }).catch(err => console.error('Failed to log activity:', err));

    toast.success('Medical record created successfully');
    return data;
  } catch (error) {
    console.error('Error creating medical record:', error);
    toast.error('Failed to create medical record');
    throw error;
  }
}

export async function updateMedicalRecord(id: string, updates: Partial<MedicalRecord>) {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Log activity
    await supabase.functions.invoke('log-activity', {
      body: {
        action: 'update',
        entity_type: 'medical_record',
        entity_id: id,
        details: { updates: Object.keys(updates) }
      }
    }).catch(err => console.error('Failed to log activity:', err));

    toast.success('Medical record updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating medical record:', error);
    toast.error('Failed to update medical record');
    throw error;
  }
}

export async function deleteMedicalRecord(id: string) {
  try {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Log activity
    await supabase.functions.invoke('log-activity', {
      body: {
        action: 'delete',
        entity_type: 'medical_record',
        entity_id: id
      }
    }).catch(err => console.error('Failed to log activity:', err));

    toast.success('Medical record deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting medical record:', error);
    toast.error('Failed to delete medical record');
    throw error;
  }
}
