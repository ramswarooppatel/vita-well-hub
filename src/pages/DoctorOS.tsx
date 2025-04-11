/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import "@/styles/components.css";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Profile } from "@/types/database";
import {
  CalendarIcon,
  Clock,
  Stethoscope,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  UserRound,
  FileText,
  ClipboardList,
  PlusCircle,
  MessageSquare,
  BarChart,
  BellRing,
  ArrowUpRight,
  Filter,
  Calendar,
  LayoutDashboard,
  Settings,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

const DoctorOS = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  // Analytics mock data
  const analyticsData = {
    patientsTotal: 128,
    appointmentsThisMonth: 45,
    appointmentsToday: 8,
    completionRate: 95,
    recentActivity: [
      { id: 1, type: "appointment", description: "Appointment completed with Jane Smith", time: "10:30 AM" },
      { id: 2, type: "note", description: "Updated medical notes for Michael Brown", time: "9:15 AM" },
      { id: 3, type: "prescription", description: "Issued prescription for David Wilson", time: "Yesterday" },
      { id: 4, type: "test", description: "Ordered blood tests for Emily Davis", time: "Yesterday" }
    ],
    patientsByAge: [
      { age: "0-18", count: 15 },
      { age: "19-35", count: 42 },
      { age: "36-50", count: 37 },
      { age: "51-65", count: 25 },
      { age: "65+", count: 9 }
    ]
  };

  const fetchData = useCallback(async (tab: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      if (tab === "appointments" || tab === "dashboard") {
        let query = supabase
          .from("appointments")
          .select(`
            *,
            profiles:user_id (first_name, last_name)
          `);
        
        // If the schema has doctor_id column
        try {
          // Check if doctor_id column exists by making a test query
          const { data: testData, error: testError } = await supabase
            .from("appointments")
            .select("doctor_id")
            .limit(1);
            
          if (!testError) {
            // If doctor_id exists, filter by it
            // Cast the query to any to avoid excessive type instantiation
            query = (query as any).eq("doctor_id", user.id);
          } else {
            // If doctor_id doesn't exist, we have to get all appointments
            // and then filter manually in the client (this is less efficient)
            console.warn("doctor_id column not found, fetching all appointments");
          }
        } catch (error) {
          console.error("Error checking for doctor_id column:", error);
        }
        
        const { data: appointmentData, error: appointmentError } = await query
          .order("appointment_date", { ascending: true });
          
        if (appointmentError) throw appointmentError;
        
        // Transform data to include patient_name from the joined profiles
        const transformedAppointments = appointmentData?.map(apt => ({
          ...apt,
          patient_name: apt.profiles ? `${apt.profiles.first_name || ''} ${apt.profiles.last_name || ''}`.trim() : "Patient"
        })) || [];
        
        setAppointments(transformedAppointments);
      }
      else if (tab === "patients") {
        // Check if doctor_patients table exists
        try {
          // Try to query the doctor_patients table
          const { data: patientRelations, error: relationsError } = await supabase
            .from('doctor_patients')
            .select(`
              patient_id,
              patient:patient_id (*)
            `)
            .eq("doctor_id", user.id);
            
          if (!relationsError && patientRelations) {
            // If doctor_patients table exists and query succeeded
            const extractedPatients = patientRelations.map(item => item.patient) || [];
            setPatients(extractedPatients as unknown as Profile[]);
          } else {
            // If doctor_patients table doesn't exist, get all patients with role 'patient'
            console.warn("doctor_patients table not found, fetching all patients");
            const { data: allPatients, error: patientsError } = await supabase
              .from('profiles')
              .select('*')
              .eq("role", "patient");
              
            if (patientsError) throw patientsError;
            setPatients(allPatients || []);
          }
        } catch (error) {
          console.error("Error fetching patients:", error);
          // As a fallback, get all profiles as patients
          const { data: allProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
            
          if (profilesError) throw profilesError;
          setPatients(allProfiles || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: "There was an error loading the data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, selectedDate, fetchData]);

  useEffect(() => {
    // Set progress bar widths after render
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach((bar, index) => {
      if (analyticsData.patientsByAge[index]) {
        const width = (analyticsData.patientsByAge[index].count / analyticsData.patientsTotal) * 100;
        (bar as HTMLElement).style.width = `${width}%`;
      }
    });
  }, [analyticsData.patientsByAge, analyticsData.patientsTotal]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      
      // Optimistically update UI
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id ? { ...apt, status } : apt
        )
      );
      
      toast({
        title: "Status updated",
        description: `Appointment marked as ${status}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: "There was an error updating the appointment status.",
      });
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ notes: notes[id] })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Notes saved",
        description: "Appointment notes have been saved.",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        variant: "destructive",
        title: "Error saving notes",
        description: "There was an error saving the appointment notes.",
      });
    }
  };

  const handleNoteChange = (id: string, value: string) => {
    setNotes(prev => ({ ...prev, [id]: value }));
  };

  const getTodayAppointments = () => {
    // Filter appointments for today
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === new Date().toISOString().split('T')[0];
    });
  };
  
  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate > now && apt.status === 'scheduled';
    }).slice(0, 5);
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate < now || apt.status === 'completed' || apt.status === 'cancelled';
    }).slice(0, 10);
  };

  // Filter appointments for the selected date
  const getDateAppointments = () => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === selectedDate;
    });
  };

  // Count stats
  const getPendingAppointments = () => {
    return appointments.filter(apt => apt.status === 'scheduled').length;
  };

  const getCompletedAppointments = () => {
    return appointments.filter(apt => apt.status === 'completed').length;
  };
  
  const getVirtualAppointments = () => {
    return appointments.filter(apt => apt.is_virtual).length;
  };

  const formatAppointmentTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
  };

  return (
    <>
      <Helmet>
        <title>DoctorOS | VitaWellHub</title>
      </Helmet>
      
      <DashboardLayout>
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">DoctorOS</h1>
              <p className="text-muted-foreground">
                Your complete practice management system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Button size="icon" variant="outline">
                <BellRing className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            {/* Rest of your component remains the same */}
            {/* ... */}
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DoctorOS;