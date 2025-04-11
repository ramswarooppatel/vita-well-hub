
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  BarChart3,
  Calendar,
  Code2,
  Database,
  FileText,
  Home,
  Settings,
  Users,
  Brain,
  Award,
  MessageSquare,
  FileImage,
  Clock,
  LogOut,
  UserCog,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { userRole, signOut } = useAuth();
  const location = useLocation();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

  useEffect(() => {
    // Base navigation items for all users
    const baseItems: SidebarItem[] = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-5 w-5" />,
        roles: ["admin", "doctor", "patient"],
      },
    ];

    // Patient-specific items
    const patientItems: SidebarItem[] = [
      {
        title: "Health Records",
        href: "/records",
        icon: <FileText className="h-5 w-5" />,
        roles: ["patient", "admin"],
      },
      {
        title: "Appointments",
        href: "/appointments",
        icon: <Calendar className="h-5 w-5" />,
        roles: ["patient", "admin"],
      },
      {
        title: "Cognitive Tests",
        href: "/cognitive-tests",
        icon: <Brain className="h-5 w-5" />,
        roles: ["patient", "admin"],
      },
      {
        title: "Find Doctors",
        href: "/find-doctors",
        icon: <Users className="h-5 w-5" />,
        roles: ["patient", "admin"],
      },
      {
        title: "Telemedicine",
        href: "/telemedicine",
        icon: <MessageSquare className="h-5 w-5" />,
        roles: ["patient", "doctor", "admin"],
      },
      {
        title: "Symptom Checker",
        href: "/symptom-checker",
        icon: <Activity className="h-5 w-5" />,
        roles: ["patient", "admin"],
      },
      {
        title: "Rewards",
        href: "/rewards",
        icon: <Award className="h-5 w-5" />,
        roles: ["patient", "admin"],
      },
    ];

    // Doctor-specific items
    const doctorItems: SidebarItem[] = [
      {
        title: "My Patients",
        href: "/doctor-dashboard",
        icon: <Users className="h-5 w-5" />,
        roles: ["doctor", "admin"],
      },
      {
        title: "Appointments",
        href: "/appointments",
        icon: <Calendar className="h-5 w-5" />,
        roles: ["doctor", "admin"],
      },
      {
        title: "Doctor's OS",
        href: "/doctor-os",
        icon: <Code2 className="h-5 w-5" />,
        roles: ["doctor", "admin"],
      },
    ];

    // Admin-specific items
    const adminItems: SidebarItem[] = [
      {
        title: "Admin Panel",
        href: "/admin",
        icon: <Database className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "User Management",
        href: "/admin/users",
        icon: <UserCog className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "Content Management",
        href: "/admin/content",
        icon: <FileImage className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: <BarChart3 className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "Activity Logs",
        href: "/admin/logs",
        icon: <Clock className="h-5 w-5" />,
        roles: ["admin"],
      },
    ];

    // Common items for all roles
    const commonItems: SidebarItem[] = [
      {
        title: "Profile",
        href: "/profile",
        icon: <Users className="h-5 w-5" />,
        roles: ["admin", "doctor", "patient"],
      },
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
        roles: ["admin", "doctor", "patient"],
      },
    ];

    // Combine all items and filter by role
    const allItems = [
      ...baseItems,
      ...patientItems,
      ...doctorItems,
      ...adminItems,
      ...commonItems,
    ];

    const filteredItems = userRole
      ? allItems.filter(
          (item) => !item.roles || item.roles.includes(userRole)
        )
      : [];

    setSidebarItems(filteredItems);
  }, [userRole]);

  if (!userRole) {
    return null;
  }

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link to="/dashboard">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              <span className="health-gradient rounded-md text-white font-bold p-1 mr-2">
                VWH
              </span>
              VitaWellHub
            </h2>
          </Link>
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-1 p-2">
                {sidebarItems.map((item, index) => (
                  <Button
                    key={index}
                    asChild
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link to={item.href}>
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 mt-4"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Logout</span>
                </Button>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
