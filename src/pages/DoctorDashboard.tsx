import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Appointment, TestResult } from "@/types/database";
import {
  Calendar,
  Clock,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  BarChart3,
  Brain,
  User,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const AppointmentSkeleton = ({ count = 1 }: { count?: number }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted mr-2" />
            <div>
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="h-5 w-16 bg-muted rounded" />
        </div>
      ))}
  </>
);

const StatSkeleton = () => (
  <div className="flex items-center">
    <div className="h-12 w-12 rounded-full bg-muted mr-3" />
    <div>
      <div className="h-6 w-16 bg-muted rounded mb-2" />
      <div className="h-4 w-24 bg-muted rounded" />
    </div>
  </div>
);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState<number>(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [testsError, setTestsError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchPatientCount();
      fetchTestResults();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq("doctor_id", user?.id);

      if (error) throw error;

      // Process the data to add patient_name
      const processedData = data.map((appointment) => ({
        ...appointment,
        patient_name: appointment.profiles
          ? `${appointment.profiles.first_name || ""} ${appointment.profiles.last_name || ""}`.trim()
          : "Unknown Patient",
      }));

      setAppointments(processedData as Appointment[]);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      setAppointmentsError(error.message);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const fetchPatientCount = async () => {
    setIsLoadingPatients(true);
    setPatientsError(null);
    try {
      const { data, error } = await supabase
        .from("doctor_patients")
        .select("patient_id", { count: "exact", head: true })
        .eq("doctor_id", user?.id);

      if (error) throw error;

      setPatientCount(data?.length || 0);
    } catch (error: any) {
      console.error("Error fetching patient count:", error);
      setPatientsError(error.message);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const fetchTestResults = async () => {
    setIsLoadingTests(true);
    setTestsError(null);
    try {
      // First get the patients associated with this doctor
      const { data: patientData, error: patientError } = await supabase
        .from("doctor_patients")
        .select("patient_id")
        .eq("doctor_id", user?.id);

      if (patientError) throw patientError;

      if (patientData && patientData.length > 0) {
        const patientIds = patientData.map((p) => p.patient_id);

        // Then get test results for these patients
        const { data: testData, error: testError } = await supabase
          .from("test_results")
          .select(`
            *,
            cognitive_tests (*, name:test_name),
            profiles:user_id (first_name, last_name)
          `)
          .in("user_id", patientIds)
          .order("created_at", { ascending: false })
          .limit(10);

        if (testError) throw testError;

        setTestResults(testData as TestResult[] || []);
      } else {
        setTestResults([]);
      }
    } catch (error: any) {
      console.error("Error fetching test results:", error);
      setTestsError(error.message);
    } finally {
      setIsLoadingTests(false);
    }
  };

  const renderUpcomingAppointments = () => {
    if (isLoadingAppointments) {
      return <AppointmentSkeleton count={3} />;
    }

    if (appointmentsError) {
      return (
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p>Failed to load appointments</p>
        </div>
      );
    }

    if (!appointments || appointments.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-medium">No Upcoming Appointments</h3>
          <p className="text-sm text-muted-foreground">
            You have no appointments scheduled for the coming days
          </p>
        </div>
      );
    }

    return appointments
      .filter((appointment) => new Date(appointment.appointment_date) > new Date())
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 5)
      .map((appointment) => (
        <div key={appointment.id} className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarImage src={`https://avatar.vercel.sh/${appointment.user_id}`} />
              <AvatarFallback>{appointment.patient_name?.charAt(0) || "P"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{appointment.patient_name || "Patient"}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' • '}{appointment.doctor_name || "You"}
              </div>
            </div>
          </div>
          <Badge variant={appointment.status === "confirmed" ? "default" : "outline"}>
            {appointment.status}
          </Badge>
        </div>
      ));
  };

  const renderRecentTestResults = () => {
    if (isLoadingTests) {
      return <AppointmentSkeleton count={3} />;
    }

    if (testsError) {
      return (
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p>Failed to load test results</p>
        </div>
      );
    }

    if (!testResults || testResults.length === 0) {
      return (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-medium">No Test Results</h3>
          <p className="text-sm text-muted-foreground">
            Your patients haven't completed any cognitive tests yet
          </p>
        </div>
      );
    }

    return testResults.slice(0, 5).map((result) => (
      <div key={result.id} className="flex items-center justify-between py-3">
        <div className="flex items-center">
          <Avatar className="h-9 w-9 mr-2">
            <AvatarImage src={`https://avatar.vercel.sh/${result.user_id}`} />
            <AvatarFallback>
              {result.profiles?.first_name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {result.profiles
                ? `${result.profiles.first_name || ""} ${
                    result.profiles.last_name || ""
                  }`.trim()
                : "Unknown Patient"}
            </div>
            <div className="text-xs text-muted-foreground">
              {result.cognitive_tests?.name || "Cognitive Test"} •{" "}
              {new Date(result.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">{result.score}%</span>
          {result.score >= 70 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Dr. {user?.user_metadata?.first_name || ""}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <StatSkeleton />
              ) : (
                <div className="text-2xl font-bold">
                  {appointments?.length || 0}
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    appointments
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Appointments
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <StatSkeleton />
              ) : (
                <div className="text-2xl font-bold">
                  {
                    appointments?.filter((a) => {
                      const today = new Date();
                      const appointmentDate = new Date(a.appointment_date);
                      return (
                        appointmentDate.getDate() === today.getDate() &&
                        appointmentDate.getMonth() === today.getMonth() &&
                        appointmentDate.getFullYear() === today.getFullYear()
                      );
                    }).length
                  }
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    today
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingPatients ? (
                <StatSkeleton />
              ) : (
                <div className="text-2xl font-bold">
                  {patientCount}
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    patients
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Cognitive Tests
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingTests ? (
                <StatSkeleton />
              ) : (
                <div className="text-2xl font-bold">
                  {testResults?.length || 0}
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    completed
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                Your schedule for the coming days
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t pt-4">
              {renderUpcomingAppointments()}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/appointments">
                  View All Appointments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>
                Latest cognitive assessments from your patients
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t pt-4">
              {renderRecentTestResults()}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/doctor-os">
                  View All Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="patients">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">
              <User className="mr-2 h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="records">
              <FileText className="mr-2 h-4 w-4" />
              Records
            </TabsTrigger>
          </TabsList>
          <TabsContent value="patients" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>
                  View and manage your patient list
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPatients ? (
                  <div className="py-8 text-center">
                    <Spinner size="lg" className="mx-auto mb-4" />
                    <p>Loading patient data...</p>
                  </div>
                ) : patientsError ? (
                  <div className="py-8 text-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p>Failed to load patient data</p>
                  </div>
                ) : patientCount === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No Patients Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any patients assigned to you yet
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="text-lg font-medium">
                      {patientCount} Patients Assigned
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View detailed information in the patient management section
                    </p>
                    <Button asChild>
                      <a href="/doctor-os">Manage Patients</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Track patient outcomes and cognitive test results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">
                        Memory Test Completion Rate
                      </h4>
                      <span className="text-sm text-muted-foreground">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">
                        Attention Test Completion Rate
                      </h4>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">
                        Problem Solving Test Completion Rate
                      </h4>
                      <span className="text-sm text-muted-foreground">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <a href="/doctor-os">View Detailed Analytics</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="records" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>
                  Access and manage patient medical records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Medical Records</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access your patients' medical history and test results
                  </p>
                  <Button asChild>
                    <a href="/records">View Records</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
