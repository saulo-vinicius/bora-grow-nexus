
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Link } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  plan: "Free"
};

const Profile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(mockUser);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  
  const handleSaveProfile = () => {
    setUser(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email
    }));
    setIsEditingProfile(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t("profile.personalInfo")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t("profile.name")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("profile.email")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        {t("common.cancel")}
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        {t("common.save")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t("profile.name")}</p>
                      <p>{user.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t("profile.email")}</p>
                      <p>{user.email}</p>
                    </div>
                    <Button onClick={() => setIsEditingProfile(true)}>
                      {t("common.edit")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t("profile.subscription")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("profile.currentPlan")}</p>
                    <p>{user.plan}</p>
                  </div>
                  <Button asChild>
                    <Link to="/upgrade">{t("profile.upgradeAccount")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <Tabs defaultValue="account">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t("profile.settings")}</CardTitle>
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="account" className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{t("profile.deleteAccount")}</h3>
                    <p className="text-sm text-muted-foreground">{t("profile.deleteAccountWarning")}</p>
                    <Button 
                      variant="destructive" 
                      className="mt-2"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      {t("profile.deleteAccount")}
                    </Button>
                  </div>
                  
                  <div className="pt-6 border-t">
                    <Button variant="outline">
                      {t("profile.logout")}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg">{t("profile.language")}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Select your preferred language
                      </p>
                      <LanguageSelector />
                    </div>
                    
                    <div className="space-y-1 pt-6 border-t">
                      <h3 className="font-medium text-lg">{t("profile.darkMode")}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Toggle between light and dark mode
                      </p>
                      <div>
                        <Button variant="outline" className="mr-2">Light</Button>
                        <Button variant="outline">Dark</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{t("profile.notificationSettings")}</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your notification preferences
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates on your device</p>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("plants.deleteWarning")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-destructive font-medium">
              This action will permanently delete:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your profile and personal information</li>
              <li>All your saved plants and their data</li>
              <li>All your saved recipes</li>
              <li>Your custom substances</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive">
              {t("profile.deleteAccount")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
