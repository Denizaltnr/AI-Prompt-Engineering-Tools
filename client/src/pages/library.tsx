import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Search,
  Star,
  Copy,
  Trash2,
  Edit2,
  Download,
  Library as LibraryIcon,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Prompt } from "@shared/schema";
import { useLanguage } from "@/components/language-provider";

export default function PromptLibrary() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const lb = t.library;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  const { data: prompts = [], isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({ title: lb.deleteSuccess });
    },
    onError: (error: Error) => {
      toast({ title: lb.deleteFail, description: error.message, variant: "destructive" });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      await apiRequest("PATCH", `/api/prompts/${id}`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
    },
    onError: (error: Error) => {
      toast({ title: lb.updateFail, description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editPrompt) return;
      await apiRequest("PATCH", `/api/prompts/${editPrompt.id}`, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(",").map((tg) => tg.trim()).filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      setEditPrompt(null);
      toast({ title: lb.updatedToast });
    },
    onError: (error: Error) => {
      toast({ title: lb.updateFail, description: error.message, variant: "destructive" });
    },
  });

  const filtered = prompts
    .filter((p) => !p.isTemplate)
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags?.some((tg) => tg.toLowerCase().includes(q))
      );
    })
    .filter((p) => {
      if (!filterTag) return true;
      return p.tags?.includes(filterTag);
    });

  const allTags = Array.from(
    new Set(prompts.filter((p) => !p.isTemplate).flatMap((p) => p.tags || []))
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: lb.copiedToast });
  };

  const exportPrompts = () => {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompts.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: lb.exportedToast });
  };

  const openEdit = (prompt: Prompt) => {
    setEditPrompt(prompt);
    setEditTitle(prompt.title);
    setEditContent(prompt.content);
    setEditTags(prompt.tags?.join(", ") || "");
  };

  const count = filtered.length;
  const subtitle = `${count} ${count === 1 ? lb.subtitleSingular : lb.subtitlePlural}`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
              {lb.title}
            </h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportPrompts} data-testid="button-export">
            <Download className="w-3 h-3 mr-1" />
            {lb.exportBtn}
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={lb.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {filterTag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterTag(null)}
                data-testid="button-clear-filter"
              >
                <X className="w-3 h-3 mr-1" />
                {lb.clearFilter}
              </Button>
            )}
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={filterTag === tag ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                data-testid={`badge-tag-${tag}`}
              >
                {tag}
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
            <LibraryIcon className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">{lb.emptyTitle}</p>
            <p className="text-xs mt-1">{lb.emptySubtitle}</p>
          </div>
        ) : (
          <motion.div className="space-y-3">
            <AnimatePresence>
              {filtered.map((prompt) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Card className="hover-elevate" data-testid={`card-prompt-${prompt.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-medium">{prompt.title}</CardTitle>
                        <div className="flex items-center gap-1">
                          {prompt.score && (
                            <Badge variant="secondary" className="text-xs">
                              {lb.scoreLabel}: {prompt.score}
                            </Badge>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              favoriteMutation.mutate({
                                id: prompt.id,
                                isFavorite: !prompt.isFavorite,
                              })
                            }
                            data-testid={`button-favorite-${prompt.id}`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                prompt.isFavorite ? "fill-amber-400 text-amber-400" : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3 font-mono">
                        {prompt.improvedContent || prompt.content}
                      </p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          {prompt.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(prompt.improvedContent || prompt.content)
                            }
                            data-testid={`button-copy-${prompt.id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(prompt)}
                            data-testid={`button-edit-${prompt.id}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(prompt.id)}
                            data-testid={`button-delete-${prompt.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <Dialog open={!!editPrompt} onOpenChange={() => setEditPrompt(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{lb.editDialog.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={lb.editDialog.titlePlaceholder}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                data-testid="input-edit-title"
              />
              <Textarea
                placeholder={lb.editDialog.contentPlaceholder}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="font-mono text-sm"
                data-testid="input-edit-content"
              />
              <Input
                placeholder={lb.editDialog.tagsPlaceholder}
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                data-testid="input-edit-tags"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPrompt(null)}>
                {lb.editDialog.cancel}
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {lb.editDialog.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
