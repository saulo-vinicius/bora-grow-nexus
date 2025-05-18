
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ThemeToggle from '@/components/ThemeToggle';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = loginSchema.extend({
  confirmPassword: z.string().min(6),
  fullName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use useEffect for navigation instead of during render
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });
  
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    
    const { error } = await signIn(values.email, values.password);
    
    setIsLoading(false);
    
    if (error) {
      setAuthError(error.message);
      return;
    }
  };
  
  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    
    const userData = values.fullName ? { full_name: values.fullName } : undefined;
    const { error } = await signUp(values.email, values.password, userData);
    
    setIsLoading(false);
    
    if (error) {
      setAuthError(error.message);
      return;
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{t('app.name')}</h1>
          <p className="text-muted-foreground">{t('app.subtitle')}</p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        
        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t('auth.login')}</CardTitle>
                <CardDescription>{t('auth.dontHaveAccount')}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="email@example.com" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t('common.loading') : t('auth.login')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center">
                  <a href="#" className="text-primary hover:underline">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>{t('auth.signup')}</CardTitle>
                <CardDescription>{t('auth.alreadyHaveAccount')}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.name')} {t('common.optional')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="email@example.com" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t('common.loading') : t('auth.signup')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <p className="text-xs text-center text-muted-foreground">
                  {t('auth.termsAgreement')}
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
