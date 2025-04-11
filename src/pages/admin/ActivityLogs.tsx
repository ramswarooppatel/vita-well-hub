
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  RefreshCw,
  Search,
  Clock,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  UserCircle,
  File,
  Calendar,
  Settings,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

// Activity Log type
interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export default function ActivityLogs() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableEntities, setAvailableEntities] = useState<string[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  // Fetch activity logs
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*, user:profiles(first_name, last_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setLogs(data || []);
      applyFilters(data || [], searchQuery, actionFilter, entityFilter);
      
      // Extract unique actions and entities
      if (data) {
        const actions = Array.from(new Set(data.map(log => log.action)));
        const entities = Array.from(new Set(data.map(log => log.entity_type)));
        setAvailableActions(actions);
        setAvailableEntities(entities);
      }
    } catch (error: any) {
      toast.error("Failed to load activity logs: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Apply filters
  const applyFilters = (data: ActivityLog[], search: string, action: string, entity: string) => {
    let filtered = [...data];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchLower) ||
        log.entity_type.toLowerCase().includes(searchLower) ||
        log.user?.first_name?.toLowerCase().includes(searchLower) ||
        log.user?.last_name?.toLowerCase().includes(searchLower) ||
        log.details?.toString().toLowerCase().includes(searchLower)
      );
    }
    
    // Action filter
    if (action && action !== "all") {
      filtered = filtered.filter(log => log.action === action);
    }
    
    // Entity filter
    if (entity && entity !== "all") {
      filtered = filtered.filter(log => log.entity_type === entity);
    }
    
    setFilteredLogs(filtered);
  };

  // Handle filter changes
  useEffect(() => {
    applyFilters(logs, searchQuery, actionFilter, entityFilter);
  }, [searchQuery, actionFilter, entityFilter, logs]);

  // Show details dialog
  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsDetailsDialogOpen(true);
  };

  // Action badge color
  const getActionColor = (action: string) => {
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

  // Entity icon
  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "user":
      case "profile":
        return <UserCircle className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "medical_record":
        return <File className="h-4 w-4" />;
      case "setting":
        return <Settings className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return format(date, "MMM dd, yyyy");
  };

  // Export logs
  const handleExport = () => {
    const headers = ["ID", "User", "Action", "Entity", "Entity ID", "IP Address", "Time"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => [
        log.id,
        `${log.user?.first_name} ${log.user?.last_name}` || log.user_id,
        log.action,
        log.entity_type,
        log.entity_id,
        log.ip_address,
        log.created_at
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `activity_logs_${new Date().toISOString()}.csv`);
    link.click();
    
    toast.success("Activity logs exported successfully");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground">
              Track user actions and system events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Filters:</span>
            </div>
            
            <Select
              value={actionFilter}
              onValueChange={setActionFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {availableActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={entityFilter}
              onValueChange={setEntityFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {availableEntities.map(entity => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Recent user and system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="font-medium">
                            {log.user ? 
                              `${log.user.first_name} ${log.user.last_name}` : 
                              `User ${log.user_id.substring(0, 8)}...`
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getEntityIcon(log.entity_type)}
                            <span>{log.entity_type}</span>
                          </div>
                        </TableCell>
                        <TableCell title={format(parseISO(log.created_at), "MMM dd, yyyy HH:mm:ss")}>
                          {formatRelativeTime(log.created_at)}
                        </TableCell>
                        <TableCell>{log.ip_address}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(log)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Clock className="h-8 w-8 mb-2" />
                          <p>No activity logs found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'} found
            </div>
          </CardFooter>
        </Card>

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Activity Log Details</DialogTitle>
              <DialogDescription>
                Complete information about this activity
              </DialogDescription>
            </DialogHeader>
            
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="font-semibold">User</div>
                  <div>
                    {selectedLog.user ? 
                      `${selectedLog.user.first_name} ${selectedLog.user.last_name}` : 
                      selectedLog.user_id
                    }
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="font-semibold">Action</div>
                  <div>
                    <Badge className={getActionColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold">Entity Type</div>
                    <div>{selectedLog.entity_type}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-semibold">Entity ID</div>
                    <div className="font-mono text-sm">{selectedLog.entity_id}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold">IP Address</div>
                    <div>{selectedLog.ip_address}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-semibold">Timestamp</div>
                    <div>{format(parseISO(selectedLog.created_at), "PPpp")}</div>
                  </div>
                </div>
                
                {selectedLog.details && (
                  <div className="space-y-1">
                    <div className="font-semibold">Details</div>
                    <pre className="rounded bg-muted p-4 overflow-auto text-xs">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
