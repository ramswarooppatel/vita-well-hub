
import {
  Calendar,
  Video,
  Stethoscope,
  Pill,
  FileText,
  AlarmClock,
  AlertCircle,
  Brain,
  Award,
  UserCog,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();
  const userRole = "admin"; // For demo: "user", "doctor", "admin"

  // Base actions available to all users
  const baseActions = [
    {
      icon: Calendar,
      label: "Book Appointment",
      color: "text-primary",
      onClick: () => navigate("/appointments"),
    },
    {
      icon: Video,
      label: "Virtual Consult",
      color: "text-wellness-500",
      onClick: () => navigate("/telemedicine"),
    },
    {
      icon: Stethoscope,
      label: "Find Doctor",
      color: "text-health-500",
      onClick: () => navigate("/doctors"),
    },
    {
      icon: AlertCircle,
      label: "Symptom Check",
      color: "text-urgent-500",
      onClick: () => navigate("/symptoms"),
    },
    {
      icon: Brain,
      label: "Cognitive Tests",
      color: "text-primary",
      onClick: () => navigate("/cognitive-tests"),
    },
    {
      icon: Award,
      label: "Rewards",
      color: "text-wellness-500",
      onClick: () => navigate("/rewards"),
    },
  ];
  
  // Additional actions for doctors
  const doctorActions = [
    {
      icon: UserCog,
      label: "Doctor Dashboard",
      color: "text-health-500",
      onClick: () => navigate("/doctor-dashboard"),
    },
  ];

  // Additional actions for admins
  const adminActions = [
    {
      icon: Shield,
      label: "Admin Panel",
      color: "text-urgent-500",
      onClick: () => navigate("/admin"),
    },
    ...doctorActions, // Admins also have access to the doctor dashboard
  ];
  
  // Combine actions based on user role
  let actions = [...baseActions];
  
  if (userRole === "doctor") {
    actions = [...baseActions, ...doctorActions];
  } else if (userRole === "admin") {
    actions = [...baseActions, ...adminActions];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <AlarmClock className="mr-2 h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="flex flex-col h-auto py-4 gap-2 card-hover"
              onClick={action.onClick}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
