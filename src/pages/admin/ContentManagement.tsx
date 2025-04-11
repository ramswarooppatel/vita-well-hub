
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Globe,
  Palette,
  Settings as SettingsIcon,
  Bell,
  Plus,
  Save,
  RefreshCw,
  Lock,
} from "lucide-react";
import { SiteSetting } from "@/types/database";

export default function ContentManagement() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSettingKey, setNewSettingKey] = useState("");
  const [newSettingValue, setNewSettingValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { settings, isLoading, updateSetting } = useSiteSettings();

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  // Save a single setting
  const handleSaveSetting = async (key: string, value: any) => {
    try {
      setIsSaving(true);
      await updateSetting(key, value);
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new setting
  const handleAddSetting = async () => {
    if (!newSettingKey.trim()) {
      toast.error("Setting key cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      let parsedValue;
      
      try {
        // Try to parse as JSON if it's not a simple string
        parsedValue = JSON.parse(newSettingValue);
      } catch (e) {
        // If it fails to parse as JSON, use it as a string
        parsedValue = newSettingValue;
      }
      
      await updateSetting(newSettingKey, parsedValue);
      setNewSettingKey("");
      setNewSettingValue("");
      setIsAddDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Get setting by key with optional default value
  const getSetting = (key: string, defaultValue: any = null) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  // Filter settings by category
  const getSettingsByCategory = (category: string) => {
    switch (category) {
      case "general":
        return settings.filter(s => 
          ["site_title", "site_description", "maintenance_mode"].includes(s.setting_key)
        );
      case "appearance":
        return settings.filter(s => 
          ["theme", "logo_url", "primary_color", "font_family"].includes(s.setting_key)
        );
      case "features":
        return settings.filter(s => 
          s.setting_key === "features" || s.setting_key.startsWith("feature_")
        );
      case "security":
        return settings.filter(s => 
          ["password_policy", "two_factor_auth", "session_timeout"].includes(s.setting_key)
        );
      default:
        return settings.filter(s => 
          !["site_title", "site_description", "maintenance_mode", "theme", "logo_url", 
            "primary_color", "font_family", "features", "password_policy", 
            "two_factor_auth", "session_timeout"].includes(s.setting_key) &&
          !s.setting_key.startsWith("feature_")
        );
    }
  };

  // Render settings based on their type
  const renderSettingValue = (setting: SiteSetting) => {
    const key = setting.setting_key;
    const value = setting.setting_value;

    if (key === "maintenance_mode" || key.startsWith("feature_") || typeof value === "boolean") {
      return (
        <div className="flex items-center gap-2">
          <Switch 
            checked={value === true} 
            onCheckedChange={(checked) => handleSaveSetting(key, checked)}
          />
          <span>{value === true ? "Enabled" : "Disabled"}</span>
        </div>
      );
    }

    if (key === "site_description") {
      return (
        <Textarea 
          defaultValue={value} 
          className="h-24"
          onBlur={(e) => {
            if (e.target.value !== value) {
              handleSaveSetting(key, e.target.value);
            }
          }}
        />
      );
    }

    if (typeof value === "object") {
      return (
        <Textarea 
          defaultValue={JSON.stringify(value, null, 2)} 
          className="h-40 font-mono text-sm"
          onBlur={(e) => {
            try {
              const newValue = JSON.parse(e.target.value);
              if (JSON.stringify(newValue) !== JSON.stringify(value)) {
                handleSaveSetting(key, newValue);
              }
            } catch (err) {
              toast.error("Invalid JSON format");
            }
          }}
        />
      );
    }

    return (
      <Input 
        defaultValue={value} 
        onBlur={(e) => {
          if (e.target.value !== value) {
            handleSaveSetting(key, e.target.value);
          }
        }}
      />
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Manage site settings and content
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Setting
          </Button>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden md:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden md:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden md:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden md:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Other Settings</span>
            </TabsTrigger>
          </TabsList>

          {["general", "appearance", "features", "security", "other"].map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {category.charAt(0).toUpperCase() + category.slice(1)} Settings
                  </CardTitle>
                  <CardDescription>
                    Manage {category} settings for your application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Spinner size="lg" />
                    </div>
                  ) : getSettingsByCategory(category).length > 0 ? (
                    getSettingsByCategory(category).map(setting => (
                      <div key={setting.id} className="grid gap-2">
                        <Label htmlFor={setting.setting_key}>
                          {setting.setting_key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </Label>
                        {renderSettingValue(setting)}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No {category} settings found
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between">
                  <p className="text-sm text-muted-foreground">
                    {getSettingsByCategory(category).length} settings
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Setting</DialogTitle>
              <DialogDescription>
                Create a new setting for your application
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="key" className="text-right">
                  Key
                </Label>
                <Input
                  id="key"
                  placeholder="setting_key"
                  className="col-span-3"
                  value={newSettingKey}
                  onChange={(e) => setNewSettingKey(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <Textarea
                  id="value"
                  placeholder="Setting value (string, number, boolean, or JSON)"
                  className="col-span-3"
                  value={newSettingValue}
                  onChange={(e) => setNewSettingValue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleAddSetting}
                disabled={isSaving || !newSettingKey.trim()}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
