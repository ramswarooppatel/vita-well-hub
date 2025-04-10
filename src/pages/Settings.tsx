import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  EyeOff,
  Eye,
  Globe,
  Palette,
  Moon,
  Sun,
  Monitor,
  Shield,
  Phone,
  Mail,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

// Define form schemas
const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
  language: z.string(),
});

const notificationsFormSchema = z.object({
  appointmentReminders: z.boolean(),
  prescriptionRefills: z.boolean(),
  labResults: z.boolean(),
  healthTips: z.boolean(),
  marketingEmails: z.boolean(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Please enter your current password.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;

const Settings = () => {
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: profile ? `${profile.first_name} ${profile.last_name}` : "",
      email: user?.email || "",
      language: "english",
    },
  });

  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      appointmentReminders: true,
      prescriptionRefills: true,
      labResults: true,
      healthTips: false,
      marketingEmails: false,
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onAccountSubmit = async (data: AccountFormValues) => {
    setIsLoading(true);
    try {
      // Extract first and last name from the full name
      const nameParts = data.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Account updated",
        description: "Your account information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update account. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationsSubmit = async (data: NotificationsFormValues) => {
    setIsLoading(true);
    try {
      // In a real app, you would save these settings to your database
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification preferences.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSecuritySubmit = async (data: SecurityFormValues) => {
    setIsLoading(true);
    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      // Reset form
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update password. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings | VitaWellHub</title>
      </Helmet>
      
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and settings
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-64">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Button
                    variant={activeTab === "account" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("account")}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                  <Button
                    variant={activeTab === "notifications" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button
                    variant={activeTab === "security" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("security")}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                  <Button
                    variant={activeTab === "appearance" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("appearance")}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                  </Button>
                </div>
                
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-muted-foreground" 
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        Update your account details and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...accountForm}>
                        <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                          <FormField
                            control={accountForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Input placeholder="Your email" {...field} disabled />
                                    {user?.email_confirmed_at ? (
                                      <Badge className="bg-health-500">Verified</Badge>
                                    ) : (
                                      <Button variant="outline" size="sm">Verify</Button>
                                    )}
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  This is the email associated with your account
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="spanish">Spanish</SelectItem>
                                    <SelectItem value="french">French</SelectItem>
                                    <SelectItem value="german">German</SelectItem>
                                    <SelectItem value="chinese">Chinese</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center justify-between pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => accountForm.reset()}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>
                        Your contact methods for account notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Change
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Phone Number</p>
                            <p className="text-sm text-muted-foreground">
                              {profile?.contact_number || "Not set"}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {profile?.contact_number ? "Change" : "Add"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Choose how and when you want to be notified
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...notificationsForm}>
                        <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                          <div className="space-y-4">
                            <FormField
                              control={notificationsForm.control}
                              name="appointmentReminders"
                              render={({ field }) => (
                                <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                                  <div className="space-y-0.5">
                                    <FormLabel className="font-medium">Appointment Reminders</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                      Receive reminders about upcoming appointments
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={notificationsForm.control}
                              name="prescriptionRefills"
                              render={({ field }) => (
                                <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                                  <div className="space-y-0.5">
                                    <FormLabel className="font-medium">Prescription Refills</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                      Get notifications when prescriptions are due for refill
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={notificationsForm.control}
                              name="labResults"
                              render={({ field }) => (
                                <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                                  <div className="space-y-0.5">
                                    <FormLabel className="font-medium">Lab Results</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                      Be notified when new lab results are available
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={notificationsForm.control}
                              name="healthTips"
                              render={({ field }) => (
                                <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                                  <div className="space-y-0.5">
                                    <FormLabel className="font-medium">Health Tips</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                      Receive personalized health tips and advice
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={notificationsForm.control}
                              name="marketingEmails"
                              render={({ field }) => (
                                <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                                  <div className="space-y-0.5">
                                    <FormLabel className="font-medium">Marketing Emails</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                      Receive promotional offers and newsletter updates
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-end pt-4">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? "Saving..." : "Save Preferences"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Channels</CardTitle>
                      <CardDescription>
                        Control how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="font-medium">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via text message
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications on your devices
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to maintain account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...securityForm}>
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                          <FormField
                            control={securityForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword.current ? "text" : "password"}
                                      placeholder="Enter current password"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                      onClick={() => toggleShowPassword('current')}
                                    >
                                      {showPassword.current ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={securityForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword.new ? "text" : "password"}
                                      placeholder="Enter new password"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                      onClick={() => toggleShowPassword('new')}
                                    >
                                      {showPassword.new ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 8 characters long
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={securityForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword.confirm ? "text" : "password"}
                                      placeholder="Confirm new password"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                      onClick={() => toggleShowPassword('confirm')}
                                    >
                                      {showPassword.confirm ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Protect your account with an additional verification step
                          </p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy & Data</CardTitle>
                      <CardDescription>
                        Manage how your information is used and stored
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <Label className="font-medium">Data Sharing</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Control how your health data is shared with providers
                          </p>
                        </div>
                        <Button variant="link">Manage Settings</Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <Label className="font-medium">Download Your Data</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Request a copy of all your health records and account data
                          </p>
                        </div>
                        <Button variant="link">Request Data</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme</CardTitle>
                      <CardDescription>
                        Customize the appearance of the application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label>Theme Mode</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div 
                            className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer
                              ${theme === "light" ? "border-primary bg-primary/5" : ""}
                            `}
                            onClick={() => setTheme("light")}
                          >
                            <Sun className="h-6 w-6" />
                            <span>Light</span>
                          </div>
                          <div 
                            className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer
                              ${theme === "dark" ? "border-primary bg-primary/5" : ""}
                            `}
                            onClick={() => setTheme("dark")}
                          >
                            <Moon className="h-6 w-6" />
                            <span>Dark</span>
                          </div>
                          <div 
                            className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer
                              ${theme === "system" ? "border-primary bg-primary/5" : ""}
                            `}
                            onClick={() => setTheme("system")}
                          >
                            <Monitor className="h-6 w-6" />
                            <span>System</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Language & Region</Label>
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                          <Globe className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <Select defaultValue="en-us">
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en-us">English (US)</SelectItem>
                                <SelectItem value="en-gb">English (UK)</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Compact Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Use a more compact layout to fit more content on screen
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Accessibility</CardTitle>
                      <CardDescription>
                        Adjust settings to improve your experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Reduced Motion</Label>
                          <p className="text-sm text-muted-foreground">
                            Minimize animations throughout the application
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="space-y-4 pt-4">
                        <Label>Text Size</Label>
                        <div className="grid grid-cols-4 gap-2">
                          <Button variant="outline" size="sm">S</Button>
                          <Button variant="outline" size="sm" className="bg-primary/5">M</Button>
                          <Button variant="outline" size="sm">L</Button>
                          <Button variant="outline" size="sm">XL</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Settings;