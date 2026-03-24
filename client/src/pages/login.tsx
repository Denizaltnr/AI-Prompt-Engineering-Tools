import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2, Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Login() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const a = t.auth;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/local-login", {
        email: loginEmail,
        password: loginPassword,
      });
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      window.location.href = "/";
    },
    onError: async (error: any) => {
      const msg = error.message || "";
      if (msg.includes("INVALID_CREDENTIALS")) {
        toast({ title: a.invalidCredentials, variant: "destructive" });
      } else {
        toast({ title: a.loginFailed, variant: "destructive" });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", {
        email: regEmail,
        password: regPassword,
        firstName: regFirstName || undefined,
        lastName: regLastName || undefined,
      });
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      window.location.href = "/";
    },
    onError: async (error: any) => {
      const msg = error.message || "";
      if (msg.includes("EMAIL_TAKEN")) {
        toast({ title: a.emailTaken, variant: "destructive" });
      } else {
        toast({ title: a.registerFailed, variant: "destructive" });
      }
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    loginMutation.mutate();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword) return;
    if (regPassword !== regConfirm) {
      toast({ title: a.passwordMismatch, variant: "destructive" });
      return;
    }
    if (regPassword.length < 6) {
      toast({ title: a.passwordTooShort, variant: "destructive" });
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-end gap-1 p-3 border-b">
        <LanguageToggle />
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
              <Wand2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">PromptForge</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.appSubtitle}</p>
          </div>

          <Card className="shadow-md">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-lg">{a.welcomeTitle}</CardTitle>
              <CardDescription>{a.welcomeSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google login */}
              <Button
                className="w-full gap-2"
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "/api/login")}
                data-testid="button-login-google"
              >
                <SiGoogle className="w-4 h-4" />
                {a.loginWithGoogle}
              </Button>

              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">{a.orContinueWith}</span>
                <Separator className="flex-1" />
              </div>

              {/* Email tabs */}
              <Tabs defaultValue="login">
                <TabsList className="w-full">
                  <TabsTrigger value="login" className="flex-1" data-testid="tab-login">
                    {a.signIn}
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex-1" data-testid="tab-register">
                    {a.signUp}
                  </TabsTrigger>
                </TabsList>

                {/* Login tab */}
                <TabsContent value="login" className="mt-4">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>{a.email}</Label>
                      <Input
                        type="email"
                        placeholder={a.emailPlaceholder}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        data-testid="input-login-email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{a.password}</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={a.passwordPlaceholder}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          data-testid="input-login-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending || !loginEmail || !loginPassword}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {loginMutation.isPending ? a.signingIn : a.signIn}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register tab */}
                <TabsContent value="register" className="mt-4">
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label>{a.firstName}</Label>
                        <Input
                          placeholder={a.firstNamePlaceholder}
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          data-testid="input-reg-firstname"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{a.lastName}</Label>
                        <Input
                          placeholder={a.lastNamePlaceholder}
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          data-testid="input-reg-lastname"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{a.email}</Label>
                      <Input
                        type="email"
                        placeholder={a.emailPlaceholder}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        data-testid="input-reg-email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{a.password}</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={a.passwordMinChars}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          data-testid="input-reg-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{a.confirmPassword}</Label>
                      <div className="relative">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder={a.confirmPasswordPlaceholder}
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          required
                          data-testid="input-reg-confirm"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending || !regEmail || !regPassword || !regConfirm}
                      data-testid="button-register-submit"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {registerMutation.isPending ? a.registering : a.signUp}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-center text-xs text-muted-foreground">
                {a.termsNote}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
