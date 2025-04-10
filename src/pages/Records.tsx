import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CalendarIcon, FileMedical, Stethoscope, Flask } from "lucide-react";

const Records = () => {
  const [activeTab, setActiveTab] = useState("medical");

  return (
    <>
      <Helmet>
        <title>Medical Records | VitaWellHub</title>
      </Helmet>
      
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
          
          <Tabs defaultValue="medical" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="lab">Lab Results</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-health-500" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <RecordItem 
                        key={record.id}
                        date={record.date}
                        title={record.title}
                        provider={record.provider}
                        description={record.description}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="lab" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flask className="h-5 w-5 text-health-500" />
                    Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {labResults.map((result) => (
                      <RecordItem 
                        key={result.id}
                        date={result.date}
                        title={result.title}
                        provider={result.provider}
                        description={result.description}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prescriptions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileMedical className="h-5 w-5 text-health-500" />
                    Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <RecordItem 
                        key={prescription.id}
                        date={prescription.date}
                        title={prescription.title}
                        provider={prescription.provider}
                        description={prescription.description}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

// Record item component for displaying individual records
const RecordItem = ({ date, title, provider, description }) => (
  <div className="border rounded-lg p-4 hover:border-health-300 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{provider}</p>
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <CalendarIcon className="h-4 w-4 mr-1" />
        {date}
      </div>
    </div>
    <p className="text-sm">{description}</p>
    <div className="mt-3 flex justify-end">
      <Button variant="outline" size="sm">View Details</Button>
    </div>
  </div>
);

// Sample data - replace with actual data from your API
const medicalRecords = [
  {
    id: 1,
    date: "Mar 15, 2025",
    title: "Annual Physical Examination",
    provider: "Dr. Sarah Johnson - Primary Care",
    description: "Routine annual physical examination with blood pressure check, heart rate monitoring, and general health assessment."
  },
  {
    id: 2,
    date: "Jan 5, 2025",
    title: "Flu Treatment",
    provider: "Dr. Michael Chen - Internal Medicine",
    description: "Treatment for influenza symptoms including fever, body aches, and fatigue. Prescribed rest and antiviral medication."
  },
  {
    id: 3,
    date: "Oct 12, 2024",
    title: "Allergy Consultation",
    provider: "Dr. Lisa Rodriguez - Allergist",
    description: "Evaluation for seasonal allergies and discussion of treatment options including medication and environmental controls."
  },
];

const labResults = [
  {
    id: 1,
    date: "Mar 16, 2025",
    title: "Complete Blood Count (CBC)",
    provider: "LifeMetrics Laboratory",
    description: "Results show normal white blood cell count, red blood cell count, and platelet levels."
  },
  {
    id: 2,
    date: "Mar 16, 2025",
    title: "Lipid Panel",
    provider: "LifeMetrics Laboratory",
    description: "Cholesterol levels within normal range. HDL: 60 mg/dL, LDL: 95 mg/dL, Total: 170 mg/dL."
  },
  {
    id: 3,
    date: "Nov 5, 2024",
    title: "Thyroid Function Test",
    provider: "MedDiagnostics",
    description: "TSH, T3, and T4 levels all within normal ranges, indicating healthy thyroid function."
  },
];

const prescriptions = [
  {
    id: 1,
    date: "Mar 15, 2025",
    title: "Loratadine 10mg",
    provider: "Dr. Sarah Johnson",
    description: "Take one tablet daily for allergies. 30-day supply with 2 refills."
  },
  {
    id: 2,
    date: "Jan 5, 2025",
    title: "Oseltamivir 75mg",
    provider: "Dr. Michael Chen",
    description: "Take one capsule twice daily for 5 days for flu treatment. No refills."
  },
  {
    id: 3,
    date: "Oct 12, 2024",
    title: "Fluticasone Propionate Nasal Spray",
    provider: "Dr. Lisa Rodriguez",
    description: "Use 2 sprays in each nostril once daily for allergies. 30-day supply with 3 refills."
  },
];

export default Records;