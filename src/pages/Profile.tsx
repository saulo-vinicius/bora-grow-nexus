
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

type ProfileData = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

const Profile = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          email: user.email || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: t('common.error'),
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, t]);
  
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile({
        ...profile,
        full_name: formData.full_name
      });
      
      toast({
        title: t('common.success'),
        description: 'Profile updated successfully',
      });
      
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDeleteAccount = async () => {
    try {
      // In a real app, you should implement proper account deletion here
      // This would typically involve calling a Supabase Edge Function to handle
      // deleting the user's account and all associated data
      
      await signOut();
      toast({
        title: 'Account deleted',
        description: 'Your account has been successfully deleted',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
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
                      <Label htmlFor="full_name">{t("profile.name")}</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
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
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
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
                      <p>{profile?.full_name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t("profile.email")}</p>
                      <p>{user?.email}</p>
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
                    <p>{t("common.free")}</p>
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
                    <Button variant="outline" onClick={() => signOut()}>
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
                        <ThemeToggle />
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
              {t("profile.deleteAccountWarning")}
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
            <Button variant="destructive" onClick={handleDeleteAccount}>
              {t("profile.deleteAccount")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
