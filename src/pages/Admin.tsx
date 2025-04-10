
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useToast } from "@/components/ui/use-toast";
import {
  UsersCog,
  Database,
  FileText,
  Settings,
  Search,
  MoreHorizontal,
  Download,
  RefreshCw,
  UsersRound,
  CalendarDays,
  Brain,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Profile,
  Appointment,
  CognitiveTest,
  TestResult,
  MedicalRecord
} from "@/types/database";

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<Profile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cognitiveTests, setCognitiveTests] = useState<CognitiveTest[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: string) => {
    setLoading(true);
    try {
      switch (tab) {
        case "users":
          const { data: userData } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
          setUsers(userData || []);
          break;
        case "appointments":
          const { data: appointmentData } = await supabase
            .from("appointments")
            .select("*")
            .order("appointment_date", { ascending: false });
          setAppointments(appointmentData || []);
          break;
        case "tests":
          const { data: testData } = await supabase
            .from("cognitive_tests")
            .select("*");
          setCognitiveTests(testData || []);
          break;
        case "results":
          const { data: resultData } = await supabase
            .from("test_results")
            .select("*, profiles(*), cognitive_tests(*)");
          setTestResults(resultData || []);
          break;
        case "records":
          const { data: recordData } = await supabase
            .from("medical_records")
            .select("*, profiles(*)");
          setMedicalRecords(recordData || []);
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

  const refreshData = () => {
    fetchData(activeTab);
    toast({
      title: "Data refreshed",
      description: "The latest data has been loaded.",
    });
  };

  const downloadCSV = () => {
    let data: any[] = [];
    let headers: string[] = [];
    
    switch (activeTab) {
      case "users":
        data = users;
        headers = ["ID", "First Name", "Last Name", "Gender", "Contact", "Created At"];
        break;
      case "appointments":
        data = appointments;
        headers = ["ID", "Doctor", "Specialty", "Date", "Status", "Virtual"];
        break;
      case "tests":
        data = cognitiveTests;
        headers = ["ID", "Test Name", "Category", "Difficulty", "Duration"];
        break;
      case "results":
        data = testResults;
        headers = ["ID", "User", "Test", "Score", "Max Score", "Completion Time"];
        break;
      case "records":
        data = medicalRecords;
        headers = ["ID", "User", "Type", "Title", "Issued Date"];
        break;
    }
    
    // Generate CSV content
    const csvContent = [
      headers.join(","),
      ...data.map(item => {
        switch (activeTab) {
          case "users":
            return [
              item.id,
              item.first_name,
              item.last_name,
              item.gender,
              item.contact_number,
              item.created_at
            ].join(",");
          case "appointments":
            return [
              item.id,
              item.doctor_name,
              item.specialty,
              item.appointment_date,
              item.status,
              item.is_virtual
            ].join(",");
          default:
            return Object.values(item).join(",");
        }
      })
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_export_${new Date().toISOString()}.csv`);
    link.click();
    
    toast({
      title: "Export successful",
      description: `${activeTab} data has been exported as CSV.`
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, appointments, and system data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Records</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(user => 
                          !searchQuery || 
                          (user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                            </TableCell>
                            <TableCell>{user.gender || "Not specified"}</TableCell>
                            <TableCell>{user.contact_number || "Not provided"}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>
                  View and manage all scheduled appointments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments
                        .filter(appointment => 
                          !searchQuery || 
                          appointment.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appointment.specialty.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="font-medium">{appointment.doctor_name}</div>
                            </TableCell>
                            <TableCell>{appointment.specialty}</TableCell>
                            <TableCell>
                              {new Date(appointment.appointment_date).toLocaleString()}
                            </TableCell>
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
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {appointments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No appointments found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Tests</CardTitle>
                <CardDescription>
                  Manage all cognitive tests in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cognitiveTests
                        .filter(test => 
                          !searchQuery || 
                          test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.category.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((test) => (
                          <TableRow key={test.id}>
                            <TableCell>
                              <div className="font-medium">{test.test_name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{test.category}</Badge>
                            </TableCell>
                            <TableCell>{test.difficulty_level}</TableCell>
                            <TableCell>{test.test_duration}s</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {cognitiveTests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No tests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  View all cognitive test results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testResults
                        .filter(result => !searchQuery)
                        .map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div className="font-medium">
                                {/* User name would go here */}
                                User
                              </div>
                            </TableCell>
                            <TableCell>
                              {/* Test name would go here */}
                              Test
                            </TableCell>
                            <TableCell>
                              <Badge>
                                {result.score}/{result.max_score}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(result.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {testResults.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No results found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>
                  View and manage medical records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Issued By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicalRecords
                        .filter(record => 
                          !searchQuery || 
                          record.title.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="font-medium">{record.title}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.record_type}</Badge>
                            </TableCell>
                            <TableCell>{record.issued_by || "Not specified"}</TableCell>
                            <TableCell>
                              {record.issued_date ? new Date(record.issued_date).toLocaleDateString() : "Not dated"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {medicalRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No records found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
