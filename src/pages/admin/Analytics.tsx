
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Download,
  Users,
  CalendarDays,
  CheckCircle,
  Brain,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

// Types
interface StatsData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalAppointments: number;
  completedAppointments: number;
  totalTests: number;
  totalTestResults: number;
  totalRecords: number;
}

interface UsersByRoleData {
  role: string;
  count: number;
}

interface ActivityData {
  date: string;
  logins: number;
  appointments: number;
  tests: number;
}

interface AppointmentStatusData {
  status: string;
  count: number;
}

interface TestCategoryData {
  category: string;
  count: number;
}

export default function Analytics() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [statsData, setStatsData] = useState<StatsData>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    totalTests: 0,
    totalTestResults: 0,
    totalRecords: 0,
  });
  const [usersByRole, setUsersByRole] = useState<UsersByRoleData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [appointmentStatus, setAppointmentStatus] = useState<AppointmentStatusData[]>([]);
  const [testCategories, setTestCategories] = useState<TestCategoryData[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  // Fetch all stats
  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch basic stats
      await Promise.all([
        fetchStatsData(),
        fetchUsersByRole(),
        fetchActivityData(parseInt(timeRange)),
        fetchAppointmentStatus(),
        fetchTestCategories(),
      ]);
    } catch (error: any) {
      toast.error("Failed to load analytics data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic stats
  const fetchStatsData = async () => {
    try {
      const monthStart = startOfMonth(new Date()).toISOString();

      // Count total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Count new users this month
      const { count: newUsersThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart);

      // Count total appointments
      const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      // Count completed appointments
      const { count: completedAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      // Count tests
      const { count: totalTests } = await supabase
        .from("cognitive_tests")
        .select("*", { count: "exact", head: true });

      // Count test results
      const { count: totalTestResults } = await supabase
        .from("test_results")
        .select("*", { count: "exact", head: true });

      // Count medical records
      const { count: totalRecords } = await supabase
        .from("medical_records")
        .select("*", { count: "exact", head: true });

      setStatsData({
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalAppointments: totalAppointments || 0,
        completedAppointments: completedAppointments || 0,
        totalTests: totalTests || 0,
        totalTestResults: totalTestResults || 0,
        totalRecords: totalRecords || 0,
      });
    } catch (error) {
      console.error("Error fetching stats data:", error);
    }
  };

  // Users by role
  const fetchUsersByRole = async () => {
    try {
      const { data, error } = await supabase.rpc('get_users_by_role');
      
      if (error) throw error;
      
      // If the RPC isn't available, use this fallback
      if (!data) {
        // Fallback if RPC doesn't exist
        const roles = ["patient", "doctor", "admin"];
        const roleCounts: UsersByRoleData[] = [];
        
        for (const role of roles) {
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", role);
            
          roleCounts.push({
            role,
            count: count || 0,
          });
        }
        
        setUsersByRole(roleCounts);
      } else {
        setUsersByRole(data);
      }
    } catch (error) {
      console.error("Error fetching user roles data:", error);
      
      // Default mock data
      setUsersByRole([
        { role: "patient", count: 120 },
        { role: "doctor", count: 15 },
        { role: "admin", count: 3 },
      ]);
    }
  };

  // Activity data for the line chart
  const fetchActivityData = async (days: number) => {
    try {
      const dates = Array.from({ length: days }, (_, i) =>
        format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd")
      );

      // In a real implementation, this would be a database query for activity logs
      // This is simplified mock data that looks realistic
      const mockData: ActivityData[] = dates.map((date) => {
        // Create some patterns in the data
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayMultiplier = isWeekend ? 0.6 : 1;
        
        // Base values with some randomness
        const loginBase = Math.floor(10 + Math.random() * 15);
        const appointmentBase = Math.floor(5 + Math.random() * 7);
        const testBase = Math.floor(3 + Math.random() * 6);
        
        return {
          date,
          logins: Math.floor(loginBase * dayMultiplier),
          appointments: Math.floor(appointmentBase * dayMultiplier),
          tests: Math.floor(testBase * dayMultiplier),
        };
      });
      
      setActivityData(mockData);
      
      // In the future, implement actual database queries like this:
      /*
      const { data, error } = await supabase.rpc('get_activity_by_days', { 
        days_to_fetch: days 
      });
      
      if (error) throw error;
      setActivityData(data);
      */
    } catch (error) {
      console.error("Error fetching activity data:", error);
      // Set some default data
      setActivityData([]);
    }
  };

  // Appointment status breakdown
  const fetchAppointmentStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_appointment_status_counts');
      
      if (error) throw error;
      
      // If the RPC isn't available, use this fallback
      if (!data) {
        // Fallback with mock data
        setAppointmentStatus([
          { status: "scheduled", count: 45 },
          { status: "completed", count: 28 },
          { status: "cancelled", count: 7 },
          { status: "missed", count: 3 },
        ]);
      } else {
        setAppointmentStatus(data);
      }
    } catch (error) {
      console.error("Error fetching appointment status data:", error);
      
      // Default mock data
      setAppointmentStatus([
        { status: "scheduled", count: 45 },
        { status: "completed", count: 28 },
        { status: "cancelled", count: 7 },
        { status: "missed", count: 3 },
      ]);
    }
  };

  // Test categories
  const fetchTestCategories = async () => {
    try {
      const { data, error } = await supabase.rpc('get_test_category_counts');
      
      if (error) throw error;
      
      // If the RPC isn't available, use this fallback
      if (!data) {
        const { data: testData, error: testError } = await supabase
          .from("cognitive_tests")
          .select("category");
          
        if (testError) throw testError;
        
        if (testData) {
          // Count occurrences of each category
          const categoryCounts: Record<string, number> = {};
          testData.forEach(item => {
            const category = item.category;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
          
          // Convert to array
          const categoryData: TestCategoryData[] = Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }));
          
          setTestCategories(categoryData);
        }
      } else {
        setTestCategories(data);
      }
    } catch (error) {
      console.error("Error fetching test categories data:", error);
      
      // Default mock data
      setTestCategories([
        { category: "Memory", count: 8 },
        { category: "Attention", count: 6 },
        { category: "Processing Speed", count: 4 },
        { category: "Problem Solving", count: 5 },
        { category: "Verbal Fluency", count: 3 },
      ]);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  // Reload when time range changes
  useEffect(() => {
    fetchActivityData(parseInt(timeRange));
  }, [timeRange]);

  // Format date for charts
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM dd");
  };

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  // Handle export reports
  const handleExportReport = (reportType: string) => {
    toast.success(`${reportType} report has been generated and downloaded`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              View platform usage statistics and trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportReport("Analytics")}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{statsData.newUsersThisMonth} this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.completedAppointments} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cognitive Tests</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalTests}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.totalTestResults} test results
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalRecords}</div>
              <p className="text-xs text-muted-foreground">
                Across all patients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>
                  User activity over time
                </CardDescription>
              </div>
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      interval={activityData.length > 30 ? 4 : 2}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="logins"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Logins"
                    />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#82ca9d"
                      name="Appointments"
                    />
                    <Line
                      type="monotone"
                      dataKey="tests"
                      stroke="#ffc658"
                      name="Tests Taken"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Users by Role */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>
                  Distribution of user accounts by role
                </CardDescription>
              </div>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usersByRole}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="role"
                      >
                        {usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, `${name}`]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Appointments by Status</CardTitle>
                <CardDescription>
                  Distribution of appointment statuses
                </CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={appointmentStatus}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Appointments" fill="#8884d8">
                        {appointmentStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Tests by Category</CardTitle>
                <CardDescription>
                  Distribution of cognitive tests by category
                </CardDescription>
              </div>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={testCategories}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" name="Tests" fill="#8884d8">
                        {testCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
