
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  UserCog,
  Database,
  BarChart3,
  FileText,
  Clock,
  Settings,
  ChevronRight,
  Users,
  FileImage,
  Calendar,
  Activity,
  Brain,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

// Data types
interface StatsData {
  totalUsers: number;
  newUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalLogs: number;
}

interface RecentActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

interface RecentUser {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface DailyStats {
  date: string;
  users: number;
  appointments: number;
  tests: number;
}

export default function AdminIndex() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    newUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalLogs: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  // Fetch admin data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentUsers(),
        fetchRecentActivities(),
        fetchDailyStats(),
      ]);
    } catch (error: any) {
      toast.error("Failed to load admin data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic stats
  const fetchStats = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get new users in last 30 days
      const { count: newUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Get total appointments
      const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      // Get pending appointments
      const { count: pendingAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled");

      // Get total activity logs
      const { count: totalLogs } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalAppointments: totalAppointments || 0,
        pendingAppointments: pendingAppointments || 0,
        totalLogs: totalLogs || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Recent users
  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setRecentUsers(data || []);
    } catch (error) {
      console.error("Error fetching recent users:", error);
    }
  };

  // Recent activity
  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("id, user_id, action, entity_type, created_at, user:profiles(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setRecentActivities(data || []);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };

  // Daily stats for chart
  const fetchDailyStats = async () => {
    try {
      // In a real implementation, this would be fetched from the database
      // Here we're generating some representative data for the UI
      const days = 7;
      const data: DailyStats[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, "MMM dd");
        
        // Generate realistic looking data with some randomness
        const baseUsers = 5 + Math.floor(Math.random() * 10);
        const baseAppointments = 3 + Math.floor(Math.random() * 8);
        const baseTests = 2 + Math.floor(Math.random() * 6);
        
        // Weekend drop pattern
        const dayOfWeek = date.getDay();
        const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;
        
        data.push({
          date: formattedDate,
          users: Math.floor(baseUsers * multiplier),
          appointments: Math.floor(baseAppointments * multiplier),
          tests: Math.floor(baseTests * multiplier),
        });
      }
      
      setDailyStats(data);
    } catch (error) {
      console.error("Error generating daily stats:", error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "doctor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "patient":
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
  };

  // Action badge color
  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
      case "insert":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "update":
      case "edit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "login":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "logout":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "view":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your application and view insights
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAdminData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsers} new in 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingAppointments} pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
              <p className="text-xs text-muted-foreground">
                System activities
              </p>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/users">
                  <UserCog className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/content">
                  <FileImage className="mr-2 h-4 w-4" />
                  Content
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/logs">
                  <Clock className="mr-2 h-4 w-4" />
                  Activity Logs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Weekly Activity Chart */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>
                User engagement over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyStats}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" name="Users" fill="#8884d8" />
                      <Bar dataKey="appointments" name="Appointments" fill="#82ca9d" />
                      <Bar dataKey="tests" name="Tests" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  Newly registered users
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/users">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "MMM d")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentUsers.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-5 w-5 mb-1" />
                          <span className="text-sm">No recent users</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions in the system
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/logs">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="font-medium">
                          {activity.user ? 
                            `${activity.user.first_name} ${activity.user.last_name}` : 
                            `User ${activity.user_id.substring(0, 8)}...`
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(activity.action)}>
                          {activity.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {activity.entity_type}
                      </TableCell>
                      <TableCell>
                        {format(new Date(activity.created_at), "HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentActivities.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Activity className="h-5 w-5 mb-1" />
                          <span className="text-sm">No recent activity</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Admin Links */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>
                Quick access to administrative features
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/users">
                  <UserCog className="mr-2 h-5 w-5" />
                  User Management
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/content">
                  <FileImage className="mr-2 h-5 w-5" />
                  Content Management
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/analytics">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analytics Dashboard
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/logs">
                  <Clock className="mr-2 h-5 w-5" />
                  Activity Logs
                </Link>
              </Button>
              <Button variant="outline" className="justify-start">
                <Database className="mr-2 h-5 w-5" />
                Database Management
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-5 w-5" />
                System Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
