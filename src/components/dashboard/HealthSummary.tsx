
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, TrendingUp, Activity, Battery } from "lucide-react";

export function HealthSummary() {
  // Sample data
  const healthMetrics = {
    heartRate: "72 bpm",
    bloodPressure: "120/80",
    steps: "8,456",
    sleep: "7.2 hrs",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/10">
            <Heart className="h-6 w-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Heart Rate</span>
            <span className="text-lg font-medium">{healthMetrics.heartRate}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-health/10">
            <TrendingUp className="h-6 w-6 text-health mb-1" />
            <span className="text-xs text-muted-foreground">Blood Pressure</span>
            <span className="text-lg font-medium">{healthMetrics.bloodPressure}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-wellness/10">
            <Activity className="h-6 w-6 text-wellness-500 mb-1" />
            <span className="text-xs text-muted-foreground">Steps Today</span>
            <span className="text-lg font-medium">{healthMetrics.steps}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted">
            <Battery className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Sleep</span>
            <span className="text-lg font-medium">{healthMetrics.sleep}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
