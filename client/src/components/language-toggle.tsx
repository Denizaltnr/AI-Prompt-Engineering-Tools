import { Button } from "@/components/ui/button";
import { useLanguage } from "./language-provider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setLanguage(language === "en" ? "tr" : "en")}
      data-testid="button-language-toggle"
      className="font-semibold text-xs px-2"
    >
      {language === "en" ? "TR" : "EN"}
    </Button>
  );
}
