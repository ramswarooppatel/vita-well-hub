
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Profile } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

export default function DoctorOS() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not a doctor
  useEffect(() => {
    if (userRole && userRole !== "doctor" && userRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  // Fetch doctor's appointments and patients
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch appointments where doctor is assigned
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select(`
            *,
            patient:profiles!appointments_user_id_fkey(
              first_name,
              last_name
            )
          `)
          .eq("doctor_id", user.id)
          .order("appointment_date", { ascending: true });

        if (appointmentsError) throw appointmentsError;

        // Transform the data to include patient name
        const transformedAppointments = appointmentsData?.map(appt => {
          return {
            ...appt,
            patient_name: appt.patient ? 
              `${appt.patient.first_name} ${appt.patient.last_name}` : 
              "Unknown Patient"
          };
        });

        setAppointments(transformedAppointments || []);

        // Fetch patient profiles linked to this doctor
        const { data: doctorPatientsData, error: doctorPatientsError } = await supabase
          .from("doctor_patients")
          .select(`
            patient_id,
            patient:profiles!doctor_patients_patient_id_fkey(*)
          `)
          .eq("doctor_id", user.id);

        if (doctorPatientsError) throw doctorPatientsError;

        // Extract patient profiles from the joined data
        const patientProfiles = doctorPatientsData
          ?.map(dp => dp.patient as Profile)
          .filter(Boolean) || [];

        setPatients(patientProfiles);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDoctorData();
    }
  }, [user]);

  const renderAppointmentStatus = (status: string = "") => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "missed":
        return <Badge variant="secondary">Missed</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Doctor Operating System</h1>
          <p className="text-muted-foreground">
            Manage your patients and appointments
          </p>
        </div>

        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <Button size="sm">+ New Appointment</Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : appointments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.patient_name}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(appointment.appointment_date),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          {renderAppointmentStatus(appointment.status)}
                        </TableCell>
                        <TableCell>
                          {appointment.is_virtual ? "Virtual" : "In-person"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Appointment Details</DialogTitle>
                                <DialogDescription>
                                  View and manage appointment information.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Patient:</div>
                                  <div className="col-span-3">
                                    {appointment.patient_name}
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Date & Time:</div>
                                  <div className="col-span-3">
                                    {format(
                                      new Date(appointment.appointment_date),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Status:</div>
                                  <div className="col-span-3">
                                    <Select defaultValue={appointment.status || "scheduled"}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="scheduled">
                                          Scheduled
                                        </SelectItem>
                                        <SelectItem value="completed">
                                          Completed
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                          Cancelled
                                        </SelectItem>
                                        <SelectItem value="missed">
                                          Missed
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Type:</div>
                                  <div className="col-span-3">
                                    {appointment.is_virtual ? "Virtual" : "In-person"}
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Specialty:</div>
                                  <div className="col-span-3">
                                    {appointment.specialty || "General"}
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 items-start gap-4">
                                  <div className="font-medium">Notes:</div>
                                  <Textarea
                                    className="col-span-3"
                                    defaultValue={appointment.notes || ""}
                                    placeholder="Add notes about the appointment..."
                                  />
                                </div>
                              </div>

                              <DialogFooter>
                                <Button type="button" variant="outline">
                                  Cancel
                                </Button>
                                <Button type="button">Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No upcoming appointments found
                </p>
                <Button size="sm">Schedule New Appointment</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Patients</h2>
              <Button size="sm">+ Add Patient</Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : patients.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium`}
                      >
                        {patient.first_name?.[0]}
                        {patient.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.gender || "Not specified"} •{" "}
                          {patient.date_of_birth
                            ? new Date(patient.date_of_birth).toLocaleDateString()
                            : "DOB not set"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {patient.contact_number || "Not provided"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {patient.email || "Not provided"}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                      <Button size="sm" variant="outline">
                        View Records
                      </Button>
                      <Button size="sm">Schedule Visit</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No patients assigned to you yet
                </p>
                <Button size="sm">Add New Patient</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
