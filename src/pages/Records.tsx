
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CalendarIcon, FileText, Stethoscope, FlaskConical, Plus, Trash, PencilLine } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MedicalRecord } from "@/types/database";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

// Add proper TypeScript interfaces
interface RecordItemProps {
  record: MedicalRecord;
  onEdit: (record: MedicalRecord) => void;
  onDelete: (recordId: string) => void;
}

// Record types for the tabs
const RECORD_TYPES = {
  medical: ["Annual Checkup", "Doctor Visit", "Hospital Stay", "Surgery", "Vaccination", "Other"],
  lab: ["Blood Test", "Urinalysis", "Imaging", "Pathology", "Genetic Test", "Other"],
  prescriptions: ["Medication", "Therapy", "Medical Device", "Dietary Supplement", "Other"]
};

const Records = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("medical");
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    record_type: "",
    issued_by: "",
    issued_date: new Date().toISOString().split('T')[0]
  });

  // Fetch records
  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setRecords(data || []);
      } catch (error: any) {
        console.error('Error fetching records:', error);
        toast.error(`Failed to load records: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  // Filter records based on active tab
  useEffect(() => {
    const filter = () => {
      switch (activeTab) {
        case "medical":
          setFilteredRecords(records.filter(record => 
            RECORD_TYPES.medical.includes(record.record_type)));
          break;
        case "lab":
          setFilteredRecords(records.filter(record => 
            RECORD_TYPES.lab.includes(record.record_type)));
          break;
        case "prescriptions":
          setFilteredRecords(records.filter(record => 
            RECORD_TYPES.prescriptions.includes(record.record_type)));
          break;
        default:
          setFilteredRecords(records);
      }
    };

    filter();
  }, [activeTab, records]);

  // Handle form data changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      record_type: "",
      issued_by: "",
      issued_date: new Date().toISOString().split('T')[0]
    });
    setCurrentRecord(null);
    setIsEditing(false);
  };

  // Open edit dialog
  const handleEdit = (record: MedicalRecord) => {
    setCurrentRecord(record);
    setFormData({
      title: record.title,
      description: record.description || "",
      record_type: record.record_type,
      issued_by: record.issued_by || "",
      issued_date: record.issued_date || new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setIsAddDialogOpen(true);
  };

  // Save or update record
  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save records");
      return;
    }

    if (!formData.title || !formData.record_type) {
      toast.error("Please fill in all required fields");
      return;
    }

    const recordData = {
      title: formData.title,
      description: formData.description,
      record_type: formData.record_type,
      issued_by: formData.issued_by,
      issued_date: formData.issued_date,
      user_id: user.id
    };

    try {
      if (isEditing && currentRecord) {
        // Update existing record
        const { error } = await supabase
          .from('medical_records')
          .update(recordData)
          .eq('id', currentRecord.id);

        if (error) throw error;
        
        setRecords(prev => 
          prev.map(r => r.id === currentRecord.id ? { ...r, ...recordData } : r)
        );
        
        toast.success("Record updated successfully");
        
        // Log the activity
        await supabase.functions.invoke('log-activity', {
          body: {
            action: 'update',
            entity_type: 'medical_record',
            entity_id: currentRecord.id,
            details: { title: recordData.title }
          }
        }).catch(err => console.error('Failed to log activity:', err));
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('medical_records')
          .insert(recordData)
          .select()
          .single();

        if (error) throw error;
        
        setRecords(prev => [data, ...prev]);
        
        toast.success("Record added successfully");
        
        // Log the activity
        await supabase.functions.invoke('log-activity', {
          body: {
            action: 'create',
            entity_type: 'medical_record',
            entity_id: data.id,
            details: { title: recordData.title }
          }
        }).catch(err => console.error('Failed to log activity:', err));
      }

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving record:', error);
      toast.error(`Failed to save record: ${error.message}`);
    }
  };

  // Delete record
  const handleDelete = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      
      setRecords(prev => prev.filter(r => r.id !== recordId));
      
      toast.success("Record deleted successfully");
      
      // Log the activity
      await supabase.functions.invoke('log-activity', {
        body: {
          action: 'delete',
          entity_type: 'medical_record',
          entity_id: recordId
        }
      }).catch(err => console.error('Failed to log activity:', err));
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error(`Failed to delete record: ${error.message}`);
    }
  };

  // Cancel dialog
  const handleCancel = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Get tab title and icon
  const getTabInfo = (tab: string) => {
    switch (tab) {
      case "medical":
        return { title: "Medical History", icon: <Stethoscope className="h-5 w-5 text-primary" /> };
      case "lab":
        return { title: "Lab Results", icon: <FlaskConical className="h-5 w-5 text-primary" /> };
      case "prescriptions":
        return { title: "Prescriptions", icon: <FileText className="h-5 w-5 text-primary" /> };
      default:
        return { title: "Records", icon: <FileText className="h-5 w-5 text-primary" /> };
    }
  };

  return (
    <>
      <Helmet>
        <title>Medical Records | VitaWellHub</title>
      </Helmet>
      
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold">Medical Records</h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Record" : "Add New Record"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Update the details of your medical record." : "Add a new entry to your medical records."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="record_type" className="text-right">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-3">
                      <Select 
                        value={formData.record_type} 
                        onValueChange={(value) => handleSelectChange("record_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" disabled>Choose record type</SelectItem>
                          <SelectItem value="" disabled className="font-semibold">Medical</SelectItem>
                          {RECORD_TYPES.medical.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                          <SelectItem value="" disabled className="font-semibold">Lab Tests</SelectItem>
                          {RECORD_TYPES.lab.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                          <SelectItem value="" disabled className="font-semibold">Prescriptions</SelectItem>
                          {RECORD_TYPES.prescriptions.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="issued_by" className="text-right">
                      Provider
                    </Label>
                    <Input
                      id="issued_by"
                      name="issued_by"
                      value={formData.issued_by}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="issued_date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="issued_date"
                      name="issued_date"
                      type="date"
                      value={formData.issued_date}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="col-span-3 h-24"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {isEditing ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="medical" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="lab">Lab Results</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTabInfo(activeTab).icon}
                    {getTabInfo(activeTab).title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : filteredRecords.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRecords.map((record) => (
                        <RecordItem 
                          key={record.id}
                          record={record}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                      <h3 className="text-lg font-medium mb-2">No records found</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't added any {activeTab} records yet.
                      </p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Record
                      </Button>
                    </div>
                  )}
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
const RecordItem = ({ record, onEdit, onDelete }: RecordItemProps) => (
  <div className="border rounded-lg p-4 hover:border-primary transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-medium text-lg">{record.title}</h3>
        <p className="text-sm text-muted-foreground">{record.issued_by || "No provider specified"}</p>
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <CalendarIcon className="h-4 w-4 mr-1" />
        {record.issued_date ? format(new Date(record.issued_date), "MMM dd, yyyy") : "No date"}
      </div>
    </div>
    <p className="text-sm">{record.description || "No description available"}</p>
    <div className="mt-3 flex justify-between items-center">
      <Badge variant="outline">{record.record_type}</Badge>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
          <PencilLine className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this medical record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(record.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </div>
);

export default Records;
