
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  Share2,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MedicalRecord } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";

// Record statuses and types for form selection
const RECORD_STATUS = ["Active", "Completed", "Pending Review"];
const RECORD_TYPES = [
  "Lab Result", 
  "Prescription", 
  "Diagnosis", 
  "Imaging", 
  "Procedure", 
  "Vaccination", 
  "Allergy", 
  "Visit Summary"
];

export default function Records() {
  // State setup
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    record_type: RECORD_TYPES[0],
    record_date: new Date().toISOString().substring(0, 10),
    provider: "",
    description: "",
    status: RECORD_STATUS[0],
  });
  
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  
  // Fetch medical records based on user role
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        let query = supabase.from('medical_records').select('*');
        
        // Filter by user ID if patient
        if (userRole === 'patient' && user) {
          query = query.eq('user_id', user.id);
        }
        
        // If doctor, fetch all records of associated patients
        if (userRole === 'doctor' && user) {
          // This would require a more complex query - for now just showing all
          // In a real app, this would filter to only show patients associated with this doctor
        }
        
        const { data, error } = await query.order('record_date', { ascending: false });
        
        if (error) throw error;
        setMedicalRecords(data || []);
      } catch (err: any) {
        console.error("Error fetching medical records:", err);
        toast({
          title: "Error",
          description: "Failed to load medical records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchRecords();
    }
  }, [user, userRole, toast]);
  
  // Filter and search records
  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.provider.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filter === "all" || record.record_type === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Reset form to defaults
  const resetForm = () => {
    setFormData({
      title: "",
      record_type: RECORD_TYPES[0],
      record_date: new Date().toISOString().substring(0, 10),
      provider: "",
      description: "",
      status: RECORD_STATUS[0],
    });
    setCurrentRecord(null);
  };
  
  // Open edit dialog with record data
  const handleEdit = (record: MedicalRecord) => {
    setCurrentRecord(record);
    setFormData({
      title: record.title,
      record_type: record.record_type,
      record_date: record.record_date.substring(0, 10),
      provider: record.provider,
      description: record.description,
      status: record.status,
    });
    setIsEditing(true);
  };
  
  // Submit form for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isEditing && currentRecord) {
        // Update existing record
        const { error } = await supabase
          .from('medical_records')
          .update({
            title: formData.title,
            record_type: formData.record_type,
            record_date: formData.record_date,
            provider: formData.provider,
            description: formData.description,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentRecord.id);
          
        if (error) throw error;
        
        // Log activity
        await supabase.functions.invoke('log-activity', {
          body: {
            action: 'update',
            entity_type: 'medical_record',
            entity_id: currentRecord.id,
          }
        });
        
        toast({
          title: "Success",
          description: "Medical record updated successfully",
        });
        
        // Update local state
        setMedicalRecords(records => 
          records.map(r => 
            r.id === currentRecord.id 
              ? { 
                  ...r, 
                  title: formData.title,
                  record_type: formData.record_type,
                  record_date: formData.record_date,
                  provider: formData.provider,
                  description: formData.description,
                  status: formData.status,
                  updated_at: new Date().toISOString(),
                } 
              : r
          )
        );
      } else {
        // Add new record
        const { data, error } = await supabase
          .from('medical_records')
          .insert({
            user_id: user.id,
            title: formData.title,
            record_type: formData.record_type,
            record_date: formData.record_date,
            provider: formData.provider,
            description: formData.description,
            status: formData.status,
          })
          .select();
          
        if (error) throw error;
        
        // Log activity
        if (data && data[0]) {
          await supabase.functions.invoke('log-activity', {
            body: {
              action: 'create',
              entity_type: 'medical_record',
              entity_id: data[0].id,
            }
          });
          
          // Update local state
          setMedicalRecords(prev => [data[0], ...prev]);
        }
        
        toast({
          title: "Success",
          description: "Medical record added successfully",
        });
      }
      
      // Reset and close dialog
      resetForm();
      isEditing ? setIsEditing(false) : setIsAdding(false);
    } catch (err: any) {
      console.error("Error saving medical record:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save medical record",
        variant: "destructive",
      });
    }
  };
  
  // Delete a record
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Log activity
      await supabase.functions.invoke('log-activity', {
        body: {
          action: 'delete',
          entity_type: 'medical_record',
          entity_id: id,
        }
      });
      
      // Update local state
      setMedicalRecords(records => records.filter(r => r.id !== id));
      
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      });
    } catch (err: any) {
      console.error("Error deleting medical record:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete medical record",
        variant: "destructive",
      });
    }
  };

  // Function to determine badge color based on status
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'pending review':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground">
              View and manage your health records
            </p>
          </div>
          
          {(userRole === 'patient' || userRole === 'admin') && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search records..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RECORD_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : filteredRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.title}</TableCell>
                          <TableCell>{record.record_type}</TableCell>
                          <TableCell>
                            {new Date(record.record_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{record.provider}</TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(record.status)}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{record.title}</DialogTitle>
                                  <DialogDescription>
                                    {record.record_type} • {new Date(record.record_date).toLocaleDateString()}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Provider</Label>
                                    <div className="col-span-3">{record.provider}</div>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Status</Label>
                                    <div className="col-span-3">
                                      <Badge variant={getBadgeVariant(record.status)}>
                                        {record.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-start gap-4">
                                    <Label className="text-right">Description</Label>
                                    <div className="col-span-3 whitespace-pre-wrap">
                                      {record.description}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Created</Label>
                                    <div className="col-span-3">
                                      {new Date(record.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                
                                <DialogFooter className="gap-2">
                                  <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" /> Download
                                  </Button>
                                  <Button variant="outline">
                                    <Share2 className="mr-2 h-4 w-4" /> Share
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            {(userRole === 'admin' || 
                             (userRole === 'patient' && user && user.id === record.user_id)) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(record)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this record? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        variant="destructive" 
                                        onClick={() => handleDelete(record.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No Records Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filter !== "all" 
                        ? "Try adjusting your search or filters"
                        : "Add your first medical record to get started"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cards">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{record.title}</CardTitle>
                          <CardDescription>
                            {record.record_type} • {new Date(record.record_date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={getBadgeVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Provider</p>
                          <p>{record.provider}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Description</p>
                          <p className="line-clamp-3">{record.description}</p>
                        </div>
                        <div className="flex justify-between pt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">View Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{record.title}</DialogTitle>
                                <DialogDescription>
                                  {record.record_type} • {new Date(record.record_date).toLocaleDateString()}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Provider</Label>
                                  <div className="col-span-3">{record.provider}</div>
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Status</Label>
                                  <div className="col-span-3">
                                    <Badge variant={getBadgeVariant(record.status)}>
                                      {record.status}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-4 items-start gap-4">
                                  <Label className="text-right">Description</Label>
                                  <div className="col-span-3 whitespace-pre-wrap">
                                    {record.description}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Created</Label>
                                  <div className="col-span-3">
                                    {new Date(record.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter className="gap-2">
                                <Button variant="outline">
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                                <Button variant="outline">
                                  <Share2 className="mr-2 h-4 w-4" /> Share
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {(userRole === 'admin' || 
                           (userRole === 'patient' && user && user.id === record.user_id)) && (
                            <div className="space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this record? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      variant="destructive" 
                                      onClick={() => handleDelete(record.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Records Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Add your first medical record to get started"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Add Record Dialog */}
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Medical Record</DialogTitle>
              <DialogDescription>
                Enter the details of your medical record
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="record_type" className="text-right">
                    Record Type
                  </Label>
                  <Select 
                    name="record_type"
                    value={formData.record_type}
                    onValueChange={(value) => handleSelectChange("record_type", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="record_date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="record_date"
                    name="record_date"
                    type="date"
                    value={formData.record_date}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="provider" className="text-right">
                    Provider
                  </Label>
                  <Input
                    id="provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="col-span-3"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_STATUS.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  resetForm();
                  setIsAdding(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Save Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Record Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Medical Record</DialogTitle>
              <DialogDescription>
                Update the details of your medical record
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-record_type" className="text-right">
                    Record Type
                  </Label>
                  <Select 
                    name="record_type"
                    value={formData.record_type}
                    onValueChange={(value) => handleSelectChange("record_type", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-record_date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="edit-record_date"
                    name="record_date"
                    type="date"
                    value={formData.record_date}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-provider" className="text-right">
                    Provider
                  </Label>
                  <Input
                    id="edit-provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="col-span-3"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_STATUS.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
