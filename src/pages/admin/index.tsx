
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoleStats, useAppointmentStatusStats } from "@/hooks/useAnalytics";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Users,
  CalendarDays,
  Brain,
  FileText,
  BarChart3,
  PieChart,
  Settings,
  ClipboardList,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { 
  BarChart as ReChartsBarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminIndex() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    totalTestResults: 0,
  });
  
  const { logs: recentActivity, isLoading: isActivityLoading } = 
    useActivityLogs({ limit: 5 });
  
  const { data: userRoleData, isLoading: isUserRoleLoading } = useUserRoleStats();
  const { data: appointmentStatusData, isLoading: isAppointmentStatusLoading } = useAppointmentStatusStats();
  
  const [registrationData, setRegistrationData] = useState([
    { month: 'Jan', users: 12 },
    { month: 'Feb', users: 19 },
    { month: 'Mar', users: 30 },
    { month: 'Apr', users: 27 },
    { month: 'May', users: 45 },
    { month: 'Jun', users: 52 },
    { month: 'Jul', users: 60 },
  ]);

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats for tests
      const { count: totalTests } = await supabase
        .from('cognitive_tests')
        .select('*', { count: 'exact', head: true });

      const { count: totalTestResults } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalTests: totalTests || 0,
        totalTestResults: totalTestResults || 0,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Calculate stats from the analytics data
  const totalUsers = userRoleData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalDoctors = userRoleData?.find(item => item.role === 'doctor')?.count || 0;
  const totalPatients = userRoleData?.find(item => item.role === 'patient')?.count || 0;
  
  const totalAppointments = appointmentStatusData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const pendingAppointments = appointmentStatusData?.find(item => item.status === 'scheduled')?.count || 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Administrator</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isUserRoleLoading ? (
                <div className="flex items-center justify-center h-8">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalDoctors} doctors, {totalPatients} patients
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isAppointmentStatusLoading ? (
                <div className="flex items-center justify-center h-8">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingAppointments} pending
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cognitive Tests</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-8">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalTests}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTestResults} results
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                View all documents
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>User Registrations</CardTitle>
              <CardDescription>
                New user registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsBarChart data={registrationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8884d8" />
                    </ReChartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View detailed analytics
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-between" asChild>
                <Link to="/admin/users">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between" asChild>
                <Link to="/admin/content">
                  <span className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Content Management
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between" asChild>
                <Link to="/admin/analytics">
                  <span className="flex items-center">
                    <PieChart className="mr-2 h-4 w-4" />
                    View Analytics
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between" asChild>
                <Link to="/admin/activity-logs">
                  <span className="flex items-center">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Activity Logs
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between" asChild>
                <Link to="/settings">
                  <span className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isActivityLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="lg" />
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-start gap-2">
                      <Badge className={getActionBadgeColor(activity.action)}>
                        {activity.action}
                      </Badge>
                      <div>
                        <p className="text-sm">
                          {activity.entity_type} ({activity.entity_id.substring(0, 8)}...)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By: {activity.user?.first_name || ""} {activity.user?.last_name || ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(activity.created_at), "MMM dd, HH:mm")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity found
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/activity-logs">
                <ClipboardList className="mr-2 h-4 w-4" />
                View all activity logs
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
