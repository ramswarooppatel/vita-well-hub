
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { signOut, userRole } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleGoHome = () => {
    const route = userRole === "admin" ? "/admin" 
      : userRole === "doctor" ? "/doctor-dashboard" 
      : "/dashboard";
    navigate(route);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
      <div className="mb-4 bg-red-100 dark:bg-red-900/30 text-red-500 p-6 rounded-full">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <div className="flex gap-4">
        <Button onClick={handleGoHome} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
