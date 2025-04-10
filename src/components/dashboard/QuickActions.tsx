
import {
  Calendar,
  Video,
  Stethoscope,
  Pill,
  FileText,
  AlarmClock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
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
      icon: Pill,
      label: "Order Medicine",
      color: "text-primary",
      onClick: () => navigate("/pharmacy"),
    },
    {
      icon: FileText,
      label: "Medical Records",
      color: "text-health-500",
      onClick: () => navigate("/records"),
    },
  ];

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
