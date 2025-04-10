
import { Database } from '@/integrations/supabase/types';

export type CognitiveTest = Database['public']['Tables']['cognitive_tests']['Row'];
export type TestQuestion = Database['public']['Tables']['test_questions']['Row'];
export type TestResult = Database['public']['Tables']['test_results']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
export type HealthMetric = Database['public']['Tables']['health_metrics']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
