
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Calendar,
  Video,
  FileText,
  AlertCircle,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  Brain,
  Award,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Heart },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/telemedicine", label: "Telemedicine", icon: Video },
  { href: "/records", label: "Records", icon: FileText },
  { href: "/symptoms", label: "Symptom Checker", icon: AlertCircle },
  { href: "/cognitive-tests", label: "Cognitive Tests", icon: Brain },
];

const adminNavItems = [
  { href: "/admin", label: "Admin Panel", icon: ShieldCheck },
  { href: "/doctor-dashboard", label: "Doctor Dashboard", icon: UserCog },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "JD";
  };

  // Get full name or email
  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || "Guest";
  };

  return (
    <nav className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <span className="health-gradient rounded-md text-white font-bold p-1">
              VWH
            </span>
            <span className="hidden sm:inline-block">VitaWellHub</span>
          </NavLink>

          {user && (
            <div className="hidden md:flex items-center gap-6 ml-6">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-1.5 text-sm ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              
              {/* Show admin navigation for admin users */}
              {userRole === "admin" && adminNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-1.5 text-sm ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              
              {/* Show doctor dashboard link only for doctors */}
              {userRole === "doctor" && (
                <NavLink
                  to="/doctor-dashboard"
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-1.5 text-sm ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <UserCog className="h-4 w-4" />
                  Doctor Dashboard
                </NavLink>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Gamification Link */}
              <NavLink to="/rewards" className="relative">
                <Button variant="ghost" size="icon">
                  <Award className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </NavLink>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-[1.2rem] w-[1.2rem]" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-urgent text-white">
                  3
                </Badge>
              </Button>
            </>
          ) : (
            // Login button when not logged in
            <Button onClick={() => navigate("/auth")} variant="default" size="sm">
              Login
            </Button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt="User" />
                    <AvatarFallback className="bg-primary text-white">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  {userRole && (
                    <Badge variant="outline" className="w-fit mt-1">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                  )}
                </div>
                <DropdownMenuItem asChild>
                  <NavLink to="/profile" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/rewards" className="w-full cursor-pointer">
                    <Award className="mr-2 h-4 w-4" />
                    <span>Rewards & Points</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t py-4 px-6 bg-background">
          <div className="flex flex-col space-y-4">
            {user ? (
              <>
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      `nav-link flex items-center gap-2 ${isActive ? "active" : ""}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
                
                {/* Show admin nav items on mobile for admins */}
                {userRole === "admin" && adminNavItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      `nav-link flex items-center gap-2 ${isActive ? "active" : ""}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
                
                {/* Show doctor dashboard on mobile for doctors */}
                {userRole === "doctor" && (
                  <NavLink
                    to="/doctor-dashboard"
                    className={({ isActive }) =>
                      `nav-link flex items-center gap-2 ${isActive ? "active" : ""}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCog className="h-4 w-4" />
                    Doctor Dashboard
                  </NavLink>
                )}
                
                <NavLink
                  to="/rewards"
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-2 ${isActive ? "active" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Award className="h-4 w-4" />
                  Rewards & Points
                </NavLink>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-start gap-2 h-auto py-2 px-3"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
