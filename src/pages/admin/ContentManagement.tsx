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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Search,
  FileImage,
  FileText,
  Upload,
  Settings,
  Trash,
  Edit,
  Plus,
  MoreHorizontal,
  Download,
  Image,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { SiteSetting } from "@/types/database";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Schema for site settings
const siteSettingsSchema = z.object({
  site_title: z.string().min(1, "Site title is required"),
  maintenance_mode: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]),
  contact_email: z.string().email("Invalid email"),
  max_file_size_mb: z.number().min(1).max(20),
});

// Schema for media upload
const mediaSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required")
    .refine(
      (files) => files[0].size <= MAX_FILE_SIZE,
      `File size must be less than 5MB`
    ),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
type MediaFormValues = z.infer<typeof mediaSchema>;

// Mock interface for files (adjust based on your actual data structure)
interface FileObject {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
  title: string;
  description?: string;
  bucket_id: string;
}

export default function ContentManagement() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("media");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsValues>({
    site_title: "VitaWellHub",
    maintenance_mode: false,
    theme: "light",
    contact_email: "support@vitawellhub.com",
    max_file_size_mb: 5,
  });

  // Forms
  const mediaForm = useForm<MediaFormValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const settingsForm = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: siteSettings,
  });

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  // Load site settings
  const fetchSiteSettings = async () => {
    try {
      // Mock site settings since we might not have access to the actual table yet
      const mockSettings: SiteSettingsValues = {
        site_title: "VitaWellHub",
        maintenance_mode: false,
        theme: "light",
        contact_email: "support@vitawellhub.com",
        max_file_size_mb: 5,
      };
      
      setSiteSettings(mockSettings);
      settingsForm.reset(mockSettings);
    } catch (error: any) {
      toast.error("Failed to load settings: " + error.message);
    }
  };

  // Load files from storage
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // Mock file data since we might not have actual storage access yet
      const mockFiles: FileObject[] = [
        {
          id: "1",
          name: "avatar1.jpg",
          size: 120000,
          type: "image/jpeg",
          url: "https://via.placeholder.com/150",
          created_at: new Date().toISOString(),
          title: "User Avatar",
          description: "Default avatar for users",
          bucket_id: "avatars"
        },
        {
          id: "2",
          name: "medical-report.pdf",
          size: 450000,
          type: "application/pdf",
          url: "#",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          title: "Medical Report Template",
          description: "Standard medical report format",
          bucket_id: "medical_records"
        },
        {
          id: "3",
          name: "hero-banner.png",
          size: 780000,
          type: "image/png",
          url: "https://via.placeholder.com/1200x300",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          title: "Website Hero Banner",
          description: "Main banner for the landing page",
          bucket_id: "site_content"
        }
      ];
      
      setFiles(mockFiles);
    } catch (error: any) {
      toast.error("Failed to load files: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchSiteSettings();
    fetchFiles();
  }, []);

  // Handle file upload
  const onUploadFile = async (data: MediaFormValues) => {
    try {
      // Mock upload functionality
      const file = data.file[0];
      
      // Update the files list with the new file
      const newFile: FileObject = {
        id: Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        title: data.title,
        description: data.description,
        bucket_id: "site_content"
      };
      
      setFiles([newFile, ...files]);
      
      toast.success("File uploaded successfully");
      setIsUploadDialogOpen(false);
      mediaForm.reset();
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    }
  };

  // Handle settings update
  const onUpdateSettings = async (data: SiteSettingsValues) => {
    try {
      // Mock update functionality
      setSiteSettings(data);
      toast.success("Settings updated successfully");
      setIsSettingsDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to update settings: " + error.message);
    }
  };

  // Handle file deletion
  const onDeleteFile = async () => {
    if (!selectedFile) return;
    
    try {
      // Mock deletion
      setFiles(files.filter(file => file.id !== selectedFile.id));
      
      toast.success("File deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to delete file: " + error.message);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "media") {
      fetchFiles();
    } else if (value === "settings") {
      fetchSiteSettings();
    }
  };

  // Filter files by search query
  const filteredFiles = files.filter(file => 
    !searchQuery || 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Manage media files and site settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "media" && (
              <>
                <Button variant="outline" size="sm" onClick={fetchFiles}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </>
            )}
            {activeTab === "settings" && (
              <Button size="sm" onClick={() => setIsSettingsDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Settings
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="media" value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Media Library
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Site Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Media Files</CardTitle>
                <CardDescription>
                  Manage all uploaded media files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Bucket</TableHead>
                        <TableHead>Date</TableHead>
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
                      ) : filteredFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {file.type.startsWith("image/") ? (
                                <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                  <File className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium truncate max-w-[200px]" title={file.name}>
                                  {file.title || file.name}
                                </div>
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {file.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{file.type}</TableCell>
                          <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {file.bucket_id}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(file.created_at), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    window.open(file.url, "_blank");
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredFiles.length === 0 && !isLoading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <FileImage className="h-8 w-8 mb-2" />
                              <p>No files found</p>
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
                  Total files: {filteredFiles.length}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>
                  Manage global settings for the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">General Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Site Title</Label>
                        <div className="font-medium">{siteSettings.site_title}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Theme</Label>
                        <div className="font-medium capitalize">{siteSettings.theme}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">System Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Maintenance Mode</Label>
                        <div>
                          <Badge variant={siteSettings.maintenance_mode ? "destructive" : "outline"}>
                            {siteSettings.maintenance_mode ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Contact Email</Label>
                        <div className="font-medium">{siteSettings.contact_email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">Upload Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Max File Size</Label>
                        <div className="font-medium">{siteSettings.max_file_size_mb} MB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setIsSettingsDialogOpen(true)}>Edit Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Media Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>
                Add files to the media library.
              </DialogDescription>
            </DialogHeader>
            <Form {...mediaForm}>
              <form onSubmit={mediaForm.handleSubmit(onUploadFile)} className="space-y-4">
                <FormField
                  control={mediaForm.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="file">Upload a file</Label>
                          <Input
                            id="file"
                            type="file"
                            {...field}
                            onChange={(event) => {
                              onChange(event.target.files);
                            }}
                          />
                          <p className="text-sm text-muted-foreground">
                            Max file size: {siteSettings.max_file_size_mb} MB
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={mediaForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="File title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={mediaForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the file"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Upload</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Site Settings</DialogTitle>
              <DialogDescription>
                Update global settings for the application.
              </DialogDescription>
            </DialogHeader>
            <Form {...settingsForm}>
              <form
                onSubmit={settingsForm.handleSubmit(onUpdateSettings)}
                className="space-y-4"
              >
                <FormField
                  control={settingsForm.control}
                  name="site_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="maintenance_mode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Maintenance Mode</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable this to put the site in maintenance mode.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="max_file_size_mb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max File Size (MB)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSettingsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this file? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteFile}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
