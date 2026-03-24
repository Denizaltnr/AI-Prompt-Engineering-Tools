import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Gauge,
  Loader2,
  Target,
  Layers,
  Shield,
  UserCircle,
  FileOutput,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScoreBreakdown } from "@shared/schema";
import { useLanguage } from "@/components/language-provider";

const criteriaKeys = [
  { key: "clarity", icon: Target },
  { key: "structure", icon: Layers },
  { key: "constraints", icon: Shield },
  { key: "roleDefinition", icon: UserCircle },
  { key: "outputSpecification", icon: FileOutput },
] as const;

export default function Scoring() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const sc = t.scoring;

  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<ScoreBreakdown | null>(null);

  const scoreMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/score-prompt", { prompt });
      return res.json();
    },
    onSuccess: (data: ScoreBreakdown) => {
      setResult(data);
    },
    onError: (error: Error) => {
      toast({ title: sc.scoreFail, description: error.message, variant: "destructive" });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 16) return "text-emerald-500";
    if (score >= 10) return "text-amber-500";
    return "text-red-500";
  };

  const getTotalColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            {sc.title}
          </h1>
          <p className="text-muted-foreground mt-1">{sc.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{sc.inputTitle}</CardTitle>
              <CardDescription>{sc.inputSub}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={sc.inputPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                data-testid="input-score-prompt"
              />
              <Button
                className="w-full"
                onClick={() => scoreMutation.mutate()}
                disabled={!prompt.trim() || scoreMutation.isPending}
                data-testid="button-score"
              >
                {scoreMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Gauge className="w-4 h-4 mr-2" />
                )}
                {scoreMutation.isPending ? sc.scoring : sc.scoreBtn}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {scoreMutation.isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="min-h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-3" />
                      <p className="text-sm">{sc.scoring}</p>
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
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base">{sc.overallTitle}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-3xl font-bold ${getTotalColor(result.total)}`}
                            data-testid="text-total-score"
                          >
                            {result.total}
                          </span>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground block">/100</span>
                            <span
                              className={`text-xs font-bold ${getTotalColor(result.total)}`}
                            >
                              {sc.grade}: {getGrade(result.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={result.total} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{sc.breakdownTitle}</CardTitle>
                      <CardDescription>{sc.breakdownSub}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {criteriaKeys.map(({ key, icon: Icon }, idx) => {
                        const score = result[key as keyof ScoreBreakdown] as number;
                        const info = sc.criteria[key];
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{info.label}</span>
                              </div>
                              <span
                                className={`text-sm font-bold ${getScoreColor(score)}`}
                                data-testid={`text-score-${key}`}
                              >
                                {score}/20
                              </span>
                            </div>
                            <Progress value={score * 5} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {info.description}
                            </p>
                          </motion.div>
                        );
                      })}
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
                      <Gauge className="w-8 h-8 mb-3 opacity-40" />
                      <p className="text-sm">{sc.emptyHint}</p>
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
