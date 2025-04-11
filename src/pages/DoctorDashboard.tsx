
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  Stethoscope,
  Users,
  Search,
  CheckCircle,
  XCircle,
  UserRound,
  FileText,
  ClipboardList,
  PlusCircle,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Appointment } from "@/types/database";

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, selectedDate]);

  const fetchData = async (tab: string) => {
    setLoading(true);
    try {
      switch (tab) {
        case "appointments":
          const { data: appointmentData } = await supabase
            .from("appointments")
            .select("*")
            .order("appointment_date", { ascending: true });
          setAppointments(appointmentData || []);
          break;
        case "patients":
          const { data: patientData } = await supabase
            .from("profiles")
            .select("*");
          setPatients(patientData || []);
          break;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: "There was an error loading the data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      
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
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: "There was an error updating the appointment status.",
      });
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await supabase
        .from("appointments")
        .update({ notes: notes[id] })
        .eq("id", id);
      
      toast({
        title: "Notes saved",
        description: "Appointment notes have been saved.",
      });
    } catch (error) {
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

  const getDayAppointments = () => {
    // Filter appointments for the selected date
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === selectedDate;
    });
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate > now && apt.status === 'scheduled';
    }).slice(0, 5);
  };

  const getPendingAppointments = () => {
    return appointments.filter(apt => apt.status === 'scheduled').length;
  };

  const getCompletedAppointments = () => {
    return appointments.filter(apt => apt.status === 'completed').length;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your appointments and patients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDayAppointments().length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-health-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCompletedAppointments()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="mr-2 h-4 w-4 text-wellness-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPendingAppointments()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  {format(new Date(selectedDate), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDayAppointments()
                        .filter(appointment => 
                          !searchQuery || 
                          appointment.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              {format(new Date(appointment.appointment_date), 'h:mm a')}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">Patient Name</div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.is_virtual ? 'Virtual' : 'In-person'}
                              </div>
                            </TableCell>
                            <TableCell>{appointment.specialty}</TableCell>
                            <TableCell>
                              <Badge variant={
                                appointment.status === "scheduled" ? "outline" :
                                appointment.status === "completed" ? "default" : 
                                "destructive"
                              }>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(appointment.id, "completed")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(appointment.id, "cancelled")}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      {getDayAppointments().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No appointments scheduled for today.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>
                    Your next scheduled appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getUpcomingAppointments().map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <UserRound className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Patient Name</div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.specialty}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {format(new Date(appointment.appointment_date), 'MMM d')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(appointment.appointment_date), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {getUpcomingAppointments().length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No upcoming appointments.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patient Notes</CardTitle>
                  <CardDescription>
                    Add notes for today's appointments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getDayAppointments().slice(0, 1).map((appointment) => (
                    <div key={appointment.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Patient Name</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(appointment.appointment_date), 'h:mm a')}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Add your notes here..."
                        className="min-h-[120px]"
                        value={notes[appointment.id] || appointment.notes || ""}
                        onChange={(e) => handleNoteChange(appointment.id, e.target.value)}
                      />
                      <Button 
                        className="mt-2 w-full" 
                        size="sm"
                        onClick={() => handleSaveNotes(appointment.id)}
                      >
                        Save Notes
                      </Button>
                    </div>
                  ))}
                  {getDayAppointments().length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No appointments to add notes for today.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients
                        .filter(patient => 
                          !searchQuery || 
                          (patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                            </TableCell>
                            <TableCell>{patient.gender || "Not specified"}</TableCell>
                            <TableCell>{patient.contact_number || "Not provided"}</TableCell>
                            <TableCell>Not available</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      {patients.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No patients found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Schedule</CardTitle>
                <CardDescription>
                  Manage your availability and working hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <div className="text-muted-foreground">
                    Calendar integration coming soon.
                  </div>
                  <Button>Set Availability</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
