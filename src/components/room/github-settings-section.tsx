"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, ExternalLink, Github, Save, Unlink } from "lucide-react";
import { useState } from "react";

interface GithubSettingsSectionProps {
  roomId: Id<"rooms">;
  userId: Id<"users">;
  isOwner: boolean;
}

export function GithubSettingsSection({
  roomId,
  userId,
  isOwner,
}: GithubSettingsSectionProps) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [personalAccessToken, setPersonalAccessToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const { toast } = useToast();
  const githubIntegration = useQuery(api.github.getGithubIntegration, {
    roomId,
  });
  const saveIntegration = useMutation(api.github.saveGithubIntegration);
  const removeIntegration = useMutation(api.github.removeGithubIntegration);

  const isConnected = !!githubIntegration;

  const handleConnect = async () => {
    if (!repositoryUrl.trim() || !personalAccessToken.trim()) {
      toast({
        title: "Missing information",
        description:
          "Please provide both repository URL and personal access token",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      await saveIntegration({
        roomId,
        userId,
        personalAccessToken: personalAccessToken.trim(),
        repositoryUrl: repositoryUrl.trim(),
      });

      toast({
        title: "GitHub connected",
        description: "Successfully connected to GitHub repository",
      });

      // Clear sensitive data
      setPersonalAccessToken("");
      setRepositoryUrl("");
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      toast({
        title: "Connection failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to GitHub",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await removeIntegration({
        roomId,
        userId,
      });

      toast({
        title: "GitHub disconnected",
        description: "GitHub integration has been removed",
      });
    } catch (error) {
      console.error("Failed to disconnect GitHub:", error);
      toast({
        title: "Disconnection failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to disconnect GitHub",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl ring-1 ring-purple-500/30">
            <Github className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              GitHub Integration
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Import issues and export estimates to GitHub
            </p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 space-y-6 md:space-y-8 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20">
          {/* Connection Status */}
          {isConnected && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100 text-lg">
                      Connected to GitHub
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                    <p>
                      <span className="font-medium">Repository:</span>{" "}
                      <a
                        href={githubIntegration.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:underline text-green-700 dark:text-green-300"
                      >
                        {githubIntegration.repositoryOwner}/
                        {githubIntegration.repositoryName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    <p>
                      <span className="font-medium">Connected:</span>{" "}
                      {new Date(
                        githubIntegration.connectedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {isOwner && (
                  <Button
                    onClick={handleDisconnect}
                    disabled={isConnecting}
                    variant="outline"
                    className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Connection Form */}
          {!isConnected && (
            <>
              <div className="space-y-6">
                {!isOwner && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Only the room owner can configure GitHub integration
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="github-repo-url"
                      className="text-base font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Repository URL
                    </Label>
                    <Input
                      id="github-repo-url"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo or owner/repo"
                      disabled={!isOwner || isConnecting}
                      className="mt-2 h-12 text-base rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="github-pat"
                      className="text-base font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Personal Access Token
                    </Label>
                    <Input
                      id="github-pat"
                      type="password"
                      value={personalAccessToken}
                      onChange={(e) => setPersonalAccessToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      disabled={!isOwner || isConnecting}
                      className="mt-2 h-12 text-base rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Your token is securely stored and never exposed to other
                      users
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-600/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-600/40"
                  >
                    {isConnecting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Connect to GitHub
                      </div>
                    )}
                  </Button>
                )}
              </div>

              <Separator />

              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  How to create a Personal Access Token
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    Go to{" "}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                    >
                      GitHub Settings → Developer settings → Personal access
                      tokens
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    Click "Generate new token" → "Generate new token (classic)"
                  </li>
                  <li>Give it a descriptive name (e.g., "Poker Planning")</li>
                  <li>
                    Select scopes:{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      repo
                    </code>{" "}
                    for private repos, or{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      public_repo
                    </code>{" "}
                    for public repos only
                  </li>
                  <li>Click "Generate token" and copy it</li>
                  <li>Paste the token above</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
