"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useAction, useMutation } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Github,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

interface GithubImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: Id<"rooms">;
  userId: Id<"users">;
}

interface GithubIssue {
  number: number;
  title: string;
  body: string;
  url: string;
  state: string;
  labels: Array<{ name: string; color: string }>;
}

export function GithubImportDialog({
  isOpen,
  onOpenChange,
  roomId,
  userId,
}: GithubImportDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importingIssues, setImportingIssues] = useState<Set<number>>(
    new Set()
  );

  const { toast } = useToast();
  const fetchIssues = useAction(api.github.fetchIssues);
  const importIssue = useMutation(api.github.importIssue);

  // Fetch issues when dialog opens
  const handleFetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedIssues = await fetchIssues({
        roomId,
        userId,
        state: "open",
      });
      setIssues(fetchedIssues);
      if (fetchedIssues.length === 0) {
        setError("No open issues found in the repository");
      }
    } catch (err) {
      console.error("Failed to fetch issues:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch issues");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter issues based on search query
  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) {
      return issues;
    }
    const query = searchQuery.toLowerCase();
    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        issue.body.toLowerCase().includes(query) ||
        issue.number.toString().includes(query)
    );
  }, [issues, searchQuery]);

  const handleImport = async (issue: GithubIssue) => {
    setImportingIssues((prev) => new Set(prev).add(issue.number));
    try {
      await importIssue({
        roomId,
        userId,
        issueNumber: issue.number,
        title: issue.title,
        description: issue.body,
        url: issue.url,
      });

      toast({
        title: "Issue imported",
        description: `#${issue.number} ${issue.title}`,
      });

      // Remove from list
      setIssues((prev) => prev.filter((i) => i.number !== issue.number));
    } catch (err) {
      console.error("Failed to import issue:", err);
      toast({
        title: "Import failed",
        description:
          err instanceof Error ? err.message : "Failed to import issue",
        variant: "destructive",
      });
    } finally {
      setImportingIssues((prev) => {
        const next = new Set(prev);
        next.delete(issue.number);
        return next;
      });
    }
  };

  // Fetch issues when dialog opens
  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (open && issues.length === 0 && !error) {
      handleFetchIssues();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="w-[90vw] max-w-4xl max-h-[85vh] p-0 gap-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-0 shadow-2xl">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl" />
        </div>

        <DialogHeader className="relative px-8 py-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-slate-50/80 via-purple-50/80 to-indigo-50/80 dark:from-gray-950/80 dark:via-purple-950/80 dark:to-indigo-950/80 backdrop-blur-sm">
          <DialogTitle className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl ring-1 ring-purple-500/30">
              <Github className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100 text-xl">
                Import GitHub Issues
              </div>
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Select issues to estimate in your planning session
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-gray-950/50 dark:to-gray-900/50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues by title, description, or number..."
                className="pl-12 h-12 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Issues list */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-white/50 via-slate-50/50 to-blue-50/50 dark:from-gray-950/50 dark:via-gray-900/50 dark:to-blue-950/50">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading issues...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      Failed to load issues
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                    <Button
                      onClick={handleFetchIssues}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading &&
              !error &&
              filteredIssues.length === 0 &&
              issues.length > 0 && (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No issues found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try a different search query
                  </p>
                </div>
              )}

            {!isLoading && !error && issues.length === 0 && (
              <div className="text-center py-16">
                <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No open issues
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This repository has no open issues to import
                </p>
              </div>
            )}

            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.number}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 hover:shadow-lg transition-all duration-300 hover:border-gray-300/50 dark:hover:border-gray-600/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-medium">
                          #{issue.number}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
                          {issue.title}
                        </h4>
                      </div>

                      {issue.body && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {issue.body}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={issue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          View on GitHub
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {issue.labels.length > 0 && (
                          <>
                            <span className="text-gray-300 dark:text-gray-700">
                              •
                            </span>
                            <div className="flex gap-1 flex-wrap">
                              {issue.labels.slice(0, 3).map((label) => (
                                <span
                                  key={label.name}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: `#${label.color}20`,
                                    color: `#${label.color}`,
                                  }}
                                >
                                  {label.name}
                                </span>
                              ))}
                              {issue.labels.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{issue.labels.length - 3} more
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleImport(issue)}
                      disabled={importingIssues.has(issue.number)}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-600/25 transition-all duration-300 hover:scale-105"
                    >
                      {importingIssues.has(issue.number) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Importing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Import
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
