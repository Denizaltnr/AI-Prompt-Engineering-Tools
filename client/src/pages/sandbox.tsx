import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FlaskConical, Play, Copy, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Sandbox() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const sb = t.sandbox;

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("chatgpt");
  const [messages, setMessages] = useState<Message[]>([]);

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sandbox-test", {
        prompt,
        model,
      });
      return res.json();
    },
    onSuccess: (data: { response: string }) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: data.response },
      ]);
      setPrompt("");
    },
    onError: (error: Error) => {
      toast({ title: sb.testFail, description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: sb.copiedToast });
  };

  const clearChat = () => {
    setMessages([]);
    setPrompt("");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            {sb.title}
          </h1>
          <p className="text-muted-foreground mt-1">{sb.subtitle}</p>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{sb.envTitle}</CardTitle>
                <Badge variant="secondary">{sb.simulated}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-[140px]" data-testid="select-sandbox-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chatgpt">ChatGPT</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                  </SelectContent>
                </Select>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    data-testid="button-clear-chat"
                  >
                    {sb.clearBtn}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[300px] max-h-[500px] overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 && !testMutation.isPending ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FlaskConical className="w-8 h-8 mb-3 opacity-40" />
                  <p className="text-sm">{sb.emptyTitle}</p>
                  <p className="text-xs mt-1">{sb.emptySubtitle}</p>
                </div>
              ) : null}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-primary/10"
                          : "bg-emerald-500/10"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {msg.role === "user" ? sb.you : model}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(msg.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded-md p-3">
                        <p
                          className="text-sm whitespace-pre-wrap leading-relaxed"
                          data-testid={`text-message-${i}`}
                        >
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {testMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-muted-foreground mb-1 block capitalize">
                      {model}
                    </span>
                    <div className="bg-muted/50 rounded-md p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {sb.generating}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder={sb.promptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (prompt.trim() && !testMutation.isPending) {
                      testMutation.mutate();
                    }
                  }
                }}
                data-testid="input-sandbox-prompt"
              />
              <Button
                onClick={() => testMutation.mutate()}
                disabled={!prompt.trim() || testMutation.isPending}
                className="self-end"
                data-testid="button-test"
              >
                {testMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
