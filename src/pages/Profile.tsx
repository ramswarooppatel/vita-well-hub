import { useState } from "react";
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
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import {
  UserRound,
  Building,
  Phone,
  Calendar,
  Mail,
  Upload,
  Lock,
  Shield,
  Bell,
  CircleHelp,
  FileText,
  LogOut,
  Trash2
} from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    contact_number: profile?.contact_number || "",
    address: profile?.address || "",
    date_of_birth: profile?.date_of_birth || "",
    gender: profile?.gender || "",
    email: user?.email || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          contact_number: formData.contact_number,
          address: formData.address,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
        })
        .eq('id', user?.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      contact_number: profile?.contact_number || "",
      address: profile?.address || "",
      date_of_birth: profile?.date_of_birth || "",
      gender: profile?.gender || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Feature not implemented",
        description: "Account deletion will be available soon.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleChangePassword = () => {
    toast({
      title: "Feature not implemented",
      description: "Password change will be available soon.",
    });
  };

  const getMemberSince = () => {
    if (profile?.created_at) {
      return new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "N/A";
  };

  return (
    <>
      <Helmet>
        <title>My Profile | VitaWellHub</title>
      </Helmet>
      
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your personal information and account settings
              </p>
            </div>
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1 h-fit">
              <CardContent className="pt-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={`${profile.first_name} ${profile.last_name}`} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="w-12 h-12 text-primary" />
                  )}
                </div>
                
                <h2 className="text-xl font-bold mb-1">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email || "User"}
                </h2>
                
                <div className="mb-4">
                  <Badge variant="outline" className="capitalize">
                    {profile?.role || "Patient"}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-6">
                  Member since {getMemberSince()}
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Profile Picture
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-3">
              <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="First name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled={true}
                          placeholder="Your email address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact_number">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="contact_number"
                              name="contact_number"
                              value={formData.contact_number}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="pl-10"
                              placeholder="Your contact number"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="date_of_birth"
                              name="date_of_birth"
                              type="date"
                              value={formData.date_of_birth}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            disabled={!isEditing}
                            value={formData.gender}
                            onValueChange={(value) => handleSelectChange("gender", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="non-binary">Non-binary</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-10 min-h-[100px]"
                            placeholder="Your address"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your password and account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Lock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">
                              Last updated 3 months ago
                            </p>
                          </div>
                        </div>
                        <Button onClick={handleChangePassword}>Change Password</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              Not enabled
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Email Verification</p>
                            <p className="text-sm text-muted-foreground">
                              {user?.email_confirmed_at ? "Verified" : "Not verified"}
                            </p>
                          </div>
                        </div>
                        {!user?.email_confirmed_at && <Button variant="outline">Verify</Button>}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Actions</CardTitle>
                      <CardDescription>
                        Manage your account access and deletion
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <LogOut className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Logout</p>
                            <p className="text-sm text-muted-foreground">
                              Sign out from all devices
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>Logout</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-destructive/10 rounded-full">
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                              Permanently delete your account and all data
                            </p>
                          </div>
                        </div>
                        <Button variant="destructive" onClick={handleDeleteAccount}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <NotificationPreference 
                          title="Appointment Reminders"
                          description="Receive reminders about upcoming appointments"
                          defaultChecked={true}
                        />
                        
                        <NotificationPreference 
                          title="Prescription Renewals"
                          description="Get notified when prescriptions are due for renewal"
                          defaultChecked={true}
                        />
                        
                        <NotificationPreference 
                          title="Lab Results"
                          description="Be informed when new lab results are available"
                          defaultChecked={true}
                        />
                        
                        <NotificationPreference 
                          title="Health Tips"
                          description="Receive personalized health tips and recommendations"
                          defaultChecked={false}
                        />
                        
                        <NotificationPreference 
                          title="Account Updates"
                          description="Important updates about your account"
                          defaultChecked={true}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Communication Channels</CardTitle>
                      <CardDescription>
                        Choose how you want to receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <ChannelPreference 
                          title="Email"
                          description="Receive notifications in your inbox"
                          defaultChecked={true}
                        />
                        
                        <ChannelPreference 
                          title="SMS"
                          description="Get text messages for urgent notifications"
                          defaultChecked={false}
                        />
                        
                        <ChannelPreference 
                          title="Push Notifications"
                          description="Receive alerts on your device"
                          defaultChecked={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="privacy" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy Settings</CardTitle>
                      <CardDescription>
                        Control how your information is shared and used
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <PrivacyPreference 
                          title="Profile Visibility"
                          description="Allow other users to see your profile"
                          defaultChecked={false}
                        />
                        
                        <PrivacyPreference 
                          title="Data Sharing with Healthcare Providers"
                          description="Share your health data with your care providers"
                          defaultChecked={true}
                        />
                        
                        <PrivacyPreference 
                          title="Anonymous Analytics"
                          description="Contribute anonymized data to improve our services"
                          defaultChecked={true}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CircleHelp className="h-4 w-4" />
                        Privacy Resources
                      </h3>
                      <div className="space-y-2 w-full">
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <a href="#" className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Privacy Policy
                          </a>
                        </Button>
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <a href="#" className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Terms of Service
                          </a>
                        </Button>
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <a href="#" className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Data Request
                          </a>
                        </Button>
                      </div>
                    </CardFooter>
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

// Helper components for the notification and privacy settings
interface PreferenceProps {
  title: string;
  description: string;
  defaultChecked: boolean;
}

const NotificationPreference = ({ title, description, defaultChecked }: PreferenceProps) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
        title="Checkbox"
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
      </label>
    </div>
  );
};

const ChannelPreference = ({ title, description, defaultChecked }: PreferenceProps) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
        title="Checkbox"
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
      </label>
    </div>
  );
};

const PrivacyPreference = ({ title, description, defaultChecked }: PreferenceProps) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
        title="Checkbox"
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
      </label>
    </div>
  );
};

export default Profile;