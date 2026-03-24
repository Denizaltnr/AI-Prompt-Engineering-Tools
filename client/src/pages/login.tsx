import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Login() {
  const { t } = useLanguage();

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
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
              <Wand2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">PromptForge</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.appSubtitle}</p>
          </div>

          <Card className="shadow-md">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">{t.auth.welcomeTitle}</CardTitle>
              <CardDescription>{t.auth.welcomeSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => (window.location.href = "/api/login")}
                data-testid="button-login"
              >
                <SiGoogle className="w-4 h-4" />
                {t.auth.loginWithGoogle}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                {t.auth.termsNote}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
