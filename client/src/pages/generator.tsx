import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Wand2, Copy, Save, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

export default function Generator() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const g = t.generator;

  const [model, setModel] = useState("chatgpt");
  const [taskType, setTaskType] = useState("coding");
  const [tone, setTone] = useState("professional");
  const [outputFormat, setOutputFormat] = useState("step-by-step");
  const [context, setContext] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const models = Object.entries(g.models) as [string, string][];
  const tasks = Object.entries(g.tasks) as [string, string][];
  const tones = Object.entries(g.tones) as [string, string][];
  const formats = Object.entries(g.formats) as [string, string][];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/generate-prompt", {
        model,
        taskType,
        tone,
        outputFormat,
        context: context || undefined,
      });
      return res.json();
    },
    onSuccess: (data: { prompt: string }) => {
      setGeneratedPrompt(data.prompt);
      toast({ title: g.copiedToast.replace("Panoya k", "Komut üretildi").replace("Copied to clipboard", "Prompt generated successfully") });
    },
    onError: (error: Error) => {
      toast({ title: g.generateFail, description: error.message, variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/prompts", {
        title: `${taskType} prompt for ${model}`,
        content: generatedPrompt,
        model,
        taskType,
        tone,
        outputFormat,
        tags: [model, taskType, tone],
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({ title: g.savedToast });
    },
    onError: (error: Error) => {
      toast({ title: g.saveFail, description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: g.copiedToast });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            {g.title}
          </h1>
          <p className="text-muted-foreground mt-1">{g.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{g.configTitle}</CardTitle>
              <CardDescription>{g.configSub}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{g.modelLabel}</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger data-testid="select-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{g.taskLabel}</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger data-testid="select-task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{g.toneLabel}</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger data-testid="select-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{g.formatLabel}</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{g.contextLabel}</Label>
                <Textarea
                  placeholder={g.contextPlaceholder}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={4}
                  data-testid="input-context"
                />
              </div>

              <Button
                className="w-full"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                data-testid="button-generate"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {generateMutation.isPending ? g.generating : g.generateBtn}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="min-h-[300px]">
              <CardHeader>
                <div className="flex items-center justify-between gap-1">
                  <CardTitle className="text-base">{g.resultTitle}</CardTitle>
                  {generatedPrompt && (
                    <Badge variant="secondary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {g.aiBadge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {generateMutation.isPending ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                    >
                      <Loader2 className="w-8 h-8 animate-spin mb-3" />
                      <p className="text-sm">{g.generating}</p>
                    </motion.div>
                  ) : generatedPrompt ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="bg-muted/50 rounded-md p-4 mb-4">
                        <pre
                          className="text-sm whitespace-pre-wrap font-mono leading-relaxed"
                          data-testid="text-generated-prompt"
                        >
                          {generatedPrompt}
                        </pre>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          data-testid="button-copy-prompt"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {g.copyBtn}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveMutation.mutate()}
                          disabled={saveMutation.isPending}
                          data-testid="button-save-prompt"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {g.saveBtn}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                    >
                      <Wand2 className="w-8 h-8 mb-3 opacity-40" />
                      <p className="text-sm">{g.emptyHint}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
