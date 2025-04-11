
import { Database } from '@/integrations/supabase/types';

export type CognitiveTest = Database['public']['Tables']['cognitive_tests']['Row'];
export type TestQuestion = Database['public']['Tables']['test_questions']['Row'];
export type TestResult = Database['public']['Tables']['test_results']['Row'] & {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
  cognitive_tests?: {
    name: string;
    category: string;
  };
};
export type HealthMetric = Database['public']['Tables']['health_metrics']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type DoctorPatient = Database['public']['Tables']['doctor_patients']['Row'];
export type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient_name?: string;
  doctor_name?: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
};

export type ActivityLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  user?: Profile;
};

export type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
};

export type RecentActivityLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: any;
  created_at: string;
};

export type UsersByRoleData = {
  role: string;
  count: number;
};

export type AppointmentStatusData = {
  status: string;
  count: number;
};

export type TestCategoryData = {
  category: string;
  count: number;
};

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  contact_number: string | null;
  address: string | null;
  email?: string | null;
  date_of_birth: string | null;
  gender: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'doctor' | 'patient';
