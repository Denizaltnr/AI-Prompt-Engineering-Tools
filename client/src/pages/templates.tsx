import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  LayoutTemplate,
  Copy,
  Save,
  Search,
  Code2,
  Lightbulb,
  Palette,
  Megaphone,
  GraduationCap,
  Bug,
  BarChart3,
  Loader2,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Prompt } from "@shared/schema";
import { useLanguage } from "@/components/language-provider";

const categoryIcons: Record<string, any> = {
  coding: Code2,
  startup: Lightbulb,
  design: Palette,
  marketing: Megaphone,
  research: GraduationCap,
  debugging: Bug,
  analysis: BarChart3,
};

const categoryColors: Record<string, { text: string; bg: string }> = {
  coding: { text: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
  startup: { text: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10" },
  design: { text: "text-pink-500 dark:text-pink-400", bg: "bg-pink-500/10" },
  marketing: { text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10" },
  research: { text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  debugging: { text: "text-red-500 dark:text-red-400", bg: "bg-red-500/10" },
  analysis: { text: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10" },
};

export default function Templates() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const tm = t.templates;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Prompt | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/templates"],
  });

  const saveMutation = useMutation({
    mutationFn: async (template: Prompt) => {
      const res = await apiRequest("POST", "/api/prompts", {
        title: template.title,
        content: template.content,
        model: template.model,
        taskType: template.taskType,
        tone: template.tone,
        outputFormat: template.outputFormat,
        tags: template.tags,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({ title: tm.savedToast });
    },
    onError: (error: Error) => {
      toast({ title: tm.saveFail, description: error.message, variant: "destructive" });
    },
  });

  const filtered = templates.filter((tmpl) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      tmpl.title.toLowerCase().includes(q) ||
      tmpl.content.toLowerCase().includes(q) ||
      tmpl.templateCategory?.toLowerCase().includes(q);
    const matchesCategory = !filterCategory || tmpl.templateCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(templates.map((tmpl) => tmpl.templateCategory).filter(Boolean))
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: tm.copiedToast });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            {tm.title}
          </h1>
          <p className="text-muted-foreground mt-1">{tm.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={tm.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-templates"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Badge
              variant={!filterCategory ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setFilterCategory(null)}
            >
              {tm.allLabel}
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={filterCategory === cat ? "default" : "secondary"}
                className="cursor-pointer capitalize"
                onClick={() => setFilterCategory(filterCategory === cat ? null : cat!)}
                data-testid={`badge-category-${cat}`}
              >
                {cat}
              </Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <LayoutTemplate className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">{tm.emptyTitle}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((template, i) => {
              const cat = template.templateCategory || "coding";
              const Icon = categoryIcons[cat] || Code2;
              const colors = categoryColors[cat] || categoryColors.coding;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="hover-elevate h-full"
                    data-testid={`card-template-${template.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-md ${colors.bg} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm">{template.title}</CardTitle>
                          <CardDescription className="capitalize">
                            {template.templateCategory}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {template.content}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                          data-testid={`button-view-${template.id}`}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {tm.viewBtn}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(template.content)}
                          data-testid={`button-copy-template-${template.id}`}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {tm.copyBtn}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveMutation.mutate(template)}
                          disabled={saveMutation.isPending}
                          data-testid={`button-save-template-${template.id}`}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {tm.saveBtn}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            </DialogHeader>
            <div className="bg-muted/50 rounded-md p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {selectedTemplate?.content}
              </pre>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedTemplate?.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 justify-end flex-wrap">
              <Button
                variant="outline"
                onClick={() =>
                  selectedTemplate && copyToClipboard(selectedTemplate.content)
                }
              >
                <Copy className="w-3 h-3 mr-1" />
                {tm.copyBtn}
              </Button>
              <Button
                onClick={() =>
                  selectedTemplate && saveMutation.mutate(selectedTemplate)
                }
                disabled={saveMutation.isPending}
              >
                <Save className="w-3 h-3 mr-1" />
                {tm.saveToLibrary}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
