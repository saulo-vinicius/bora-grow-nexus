
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Mock user data - would come from Supabase auth in production
const mockUser = {
  id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com",
  subscription: {
    plan: "free",
    expiresAt: "2025-06-15T00:00:00Z",
  }
};

const Profile = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(mockUser);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [language, setLanguage] = useState(i18n.language);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    localStorage.setItem("language", value);
  };
  
  const handleThemeChange = (value: boolean) => {
    const newTheme = value ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", value);
    localStorage.setItem("theme", newTheme);
  };
  
  const handleLogout = () => {
    // In a real app, this would call the Supabase auth.signOut() method
    console.log("Logging out...");
  };
  
  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>
      
      <Tabs defaultValue="account">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="account">{t("profile.personalInfo")}</TabsTrigger>
          <TabsTrigger value="subscription">{t("profile.subscription")}</TabsTrigger>
          <TabsTrigger value="settings">{t("profile.settings")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.personalInfo")}</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              <div>
                <Label htmlFor="email">{t("profile.email")}</Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive">{t("profile.deleteAccount")}</Button>
              <Button>{t("common.save")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.subscription")}</CardTitle>
              <CardDescription>
                Manage your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{t("profile.currentPlan")}:</span>
                  <span className="capitalize">
                    {user.subscription.plan === "free" ? t("common.free") : t("common.premium")}
                  </span>
                </div>
                {user.subscription.plan === "premium" && (
                  <div className="flex justify-between">
                    <span className="font-medium">Expires:</span>
                    <span>{new Date(user.subscription.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {user.subscription.plan === "free" ? (
                  <Button className="w-full">
                    {t("profile.upgradeAccount")}
                  </Button>
                ) : (
                  <>
                    <Button className="w-full">
                      {t("profile.manageSubscription")}
                    </Button>
                    <Button variant="outline" className="w-full">
                      {t("profile.cancelSubscription")}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.settings")}</CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="language">{t("profile.language")}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("profile.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="br">Português (Brasil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">{t("profile.darkMode")}</Label>
                <Switch 
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeChange}
                />
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-2">{t("profile.notificationSettings")}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch 
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch 
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogout} className="w-full">
                {t("profile.logout")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
