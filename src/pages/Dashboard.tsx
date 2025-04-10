
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AppointmentCard, Appointment } from "@/components/dashboard/AppointmentCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HealthSummary } from "@/components/dashboard/HealthSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Calendar, Users, FileText, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([
    {
      id: "1",
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "March 15, 2025",
      time: "10:30 AM",
      location: "Heart Care Center, Building A",
      isVirtual: false,
    },
    {
      id: "2",
      doctorName: "Dr. Michael Chen",
      specialty: "General Practitioner",
      date: "March 22, 2025",
      time: "2:00 PM",
      location: "Online Video Consultation",
      isVirtual: true,
    },
  ]);

  const handleReschedule = (id: string) => {
    toast({
      title: "Appointment Reschedule",
      description: "The reschedule option will be available soon.",
    });
  };

  const handleCancel = (id: string) => {
    // Show confirmation
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setUpcomingAppointments(prev => prev.filter(app => app.id !== id));
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, John</h1>
            <p className="text-muted-foreground">Here's an overview of your health dashboard</p>
          </div>
          <Button className="sm:self-start">
            <Calendar className="mr-2 h-4 w-4" /> Book Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onReschedule={handleReschedule}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <Button variant="outline" className="mt-2">
                      Schedule an appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="medications">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="reports">Lab Reports</TabsTrigger>
                <TabsTrigger value="records">Medical Records</TabsTrigger>
              </TabsList>
              <TabsContent value="medications">
                <Card>
                  <CardContent className="py-4">
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-2">No active medications</p>
                      <Button variant="link">Add medication</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports">
                <Card>
                  <CardContent className="py-4">
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-2">No recent lab reports</p>
                      <Button variant="link">Upload reports</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="records">
                <Card>
                  <CardContent className="py-4">
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-2">No medical records found</p>
                      <Button variant="link">Upload medical records</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <QuickActions />
            <HealthSummary />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Care Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">SJ</span>
                    </div>
                    <div>
                      <p className="font-medium">Dr. Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Cardiologist</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">MC</span>
                    </div>
                    <div>
                      <p className="font-medium">Dr. Michael Chen</p>
                      <p className="text-sm text-muted-foreground">General Practitioner</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="py-6">
          <Card className="bg-primary/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Complete Your Health Profile</h3>
                  <p className="text-muted-foreground mb-2">Add your medical history to get personalized care recommendations.</p>
                  <div className="w-full max-w-xs bg-background rounded-full h-2.5 mb-2">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">45% complete</p>
                </div>
                <Button className="self-start">
                  <FileText className="mr-2 h-4 w-4" /> Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
