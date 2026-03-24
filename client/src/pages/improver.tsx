import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sparkles, Copy, Save, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ImproveResult } from "@shared/schema";
import { useLanguage } from "@/components/language-provider";

export default function Improver() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const im = t.improver;

  const [inputPrompt, setInputPrompt] = useState("");
  const [result, setResult] = useState<ImproveResult | null>(null);

  const improveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/improve-prompt", {
        prompt: inputPrompt,
      });
      return res.json();
    },
    onSuccess: (data: ImproveResult) => {
      setResult(data);
      toast({ title: im.improvedToast });
    },
    onError: (error: Error) => {
      toast({ title: im.improveFail, description: error.message, variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result) return;
      const res = await apiRequest("POST", "/api/prompts", {
        title: "Improved prompt",
        content: inputPrompt,
        improvedContent: result.improvedPrompt,
        score: result.score,
        tags: result.techniques,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({ title: im.savedToast });
    },
    onError: (error: Error) => {
      toast({ title: im.saveFail, description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: im.copiedToast });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            {im.title}
          </h1>
          <p className="text-muted-foreground mt-1">{im.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{im.inputTitle}</CardTitle>
                <CardDescription>{im.inputSub}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={im.inputPlaceholder}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  data-testid="input-original-prompt"
                />
                <Button
                  className="w-full"
                  onClick={() => improveMutation.mutate()}
                  disabled={!inputPrompt.trim() || improveMutation.isPending}
                  data-testid="button-improve"
                >
                  {improveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {improveMutation.isPending ? im.improving : im.improveBtn}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {improveMutation.isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="min-h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-3" />
                      <p className="text-sm">{im.improving}</p>
                    </div>
                  </Card>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-1">
                        <CardTitle className="text-base">{im.resultTitle}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl font-bold ${getScoreColor(result.score)}`}
                            data-testid="text-score"
                          >
                            {result.score}
                          </span>
                          <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground mb-1">
                          <span>{im.qualityScore}</span>
                          <span>{result.score}%</span>
                        </div>
                        <Progress value={result.score} />
                      </div>

                      <div className="bg-muted/50 rounded-md p-4">
                        <pre
                          className="text-sm whitespace-pre-wrap font-mono leading-relaxed"
                          data-testid="text-improved-prompt"
                        >
                          {result.improvedPrompt}
                        </pre>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.improvedPrompt)}
                          data-testid="button-copy-improved"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {im.copyBtn}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveMutation.mutate()}
                          disabled={saveMutation.isPending}
                          data-testid="button-save-improved"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {im.saveBtn}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInputPrompt(result.improvedPrompt);
                            setResult(null);
                          }}
                          data-testid="button-use-as-input"
                        >
                          <ArrowRight className="w-3 h-3 mr-1" />
                          {im.reImproveBtn}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{im.improvementsTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.improvements.map((improvement, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <p className="text-sm">{improvement}</p>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {result.techniques.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="min-h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Sparkles className="w-8 h-8 mb-3 opacity-40" />
                      <p className="text-sm">{im.emptyHint}</p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
