
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  useUserRoleStats,
  useAppointmentStatusStats,
  useTestCategoryStats
} from "@/hooks/useAnalytics";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Spinner } from "@/components/ui/spinner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { UsersByRoleData, AppointmentStatusData, TestCategoryData } from "@/types/database";
import { RefreshCw } from "lucide-react";

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6384'];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("users");
  
  const { 
    data: userRoleData, 
    isLoading: isUserRoleLoading, 
    error: userRoleError, 
    refetch: refetchUserRoleStats 
  } = useUserRoleStats();
  
  const { 
    data: appointmentStatusData, 
    isLoading: isAppointmentStatusLoading, 
    error: appointmentStatusError, 
    refetch: refetchAppointmentStatusStats 
  } = useAppointmentStatusStats();
  
  const { 
    data: testCategoryData, 
    isLoading: isTestCategoryLoading, 
    error: testCategoryError, 
    refetch: refetchTestCategoryStats 
  } = useTestCategoryStats();

  // Format user roles data for display
  const formatUserRoleData = (data: UsersByRoleData[]) => {
    // Capitalize the first letter of each role
    return data.map(item => ({
      ...item,
      role: item.role === 'unknown' ? 'Unknown' : 
        item.role.charAt(0).toUpperCase() + item.role.slice(1)
    }));
  };

  // Render the user roles chart
  const renderUserRolesChart = () => {
    if (isUserRoleLoading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <Spinner size="lg" />
        </div>
      );
    }

    if (userRoleError) {
      return (
        <div className="flex items-center justify-center h-[300px] text-destructive">
          Error loading user data: {userRoleError.message}
        </div>
      );
    }

    if (!userRoleData || userRoleData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No user data available
        </div>
      );
    }

    const formattedData = formatUserRoleData(userRoleData);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="role"
                label={({ role, count }) => `${role}: ${count}`}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [value, props.payload.role]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render the appointment status chart
  const renderAppointmentStatusChart = () => {
    if (isAppointmentStatusLoading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <Spinner size="lg" />
        </div>
      );
    }

    if (appointmentStatusError) {
      return (
        <div className="flex items-center justify-center h-[300px] text-destructive">
          Error loading appointment data: {appointmentStatusError.message}
        </div>
      );
    }

    if (!appointmentStatusData || appointmentStatusData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No appointment data available
        </div>
      );
    }

    const formattedData = appointmentStatusData.map(item => ({
      ...item,
      status: item.status === 'unknown' ? 'Unknown' : 
        item.status.charAt(0).toUpperCase() + item.status.slice(1)
    }));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Number of Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#82ca9d"
                dataKey="count"
                nameKey="status"
                label={({ status, count }) => `${status}: ${count}`}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [value, props.payload.status]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render the test category chart
  const renderTestCategoryChart = () => {
    if (isTestCategoryLoading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <Spinner size="lg" />
        </div>
      );
    }

    if (testCategoryError) {
      return (
        <div className="flex items-center justify-center h-[300px] text-destructive">
          Error loading test data: {testCategoryError.message}
        </div>
      );
    }

    if (!testCategoryData || testCategoryData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No test category data available
        </div>
      );
    }

    const formattedData = testCategoryData.map(item => ({
      ...item,
      category: item.category === 'unknown' ? 'Unknown' : 
        item.category.charAt(0).toUpperCase() + item.category.slice(1)
    }));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ff7300" name="Number of Tests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#ff7300"
                dataKey="count"
                nameKey="category"
                label={({ category, count }) => `${category}: ${count}`}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [value, props.payload.category]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Detailed analytics on users, appointments, and cognitive tests
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (activeTab === "users") {
                refetchUserRoleStats();
              } else if (activeTab === "appointments") {
                refetchAppointmentStatusStats();
              } else if (activeTab === "tests") {
                refetchTestCategoryStats();
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Statistics</TabsTrigger>
            <TabsTrigger value="appointments">Appointment Analytics</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution by Role</CardTitle>
                <CardDescription>
                  Breakdown of registered users by their assigned role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderUserRolesChart()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Status</CardTitle>
                <CardDescription>
                  Overview of appointments categorized by their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderAppointmentStatusChart()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Tests by Category</CardTitle>
                <CardDescription>
                  Distribution of cognitive tests across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTestCategoryChart()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
