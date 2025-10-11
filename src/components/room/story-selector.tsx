"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { BookOpen, Check, ChevronDown } from "lucide-react";

interface StorySelectorProps {
  roomId: Id<"rooms">;
}

export function StorySelector({ roomId }: StorySelectorProps) {
  const storyNodes = useQuery(api.canvas.getStoryNodes, { roomId });
  const setActiveStory = useMutation(api.stories.setActiveStory);
  const room = useQuery(api.rooms.get, { roomId });

  const activeStoryNodeId = room?.activeStoryNodeId;

  const activeStory = storyNodes?.find(
    (node) => node.nodeId === activeStoryNodeId
  );

  if (!storyNodes || storyNodes.length === 0) {
    return null;
  }

  const handleStorySelect = async (nodeId: string) => {
    try {
      await setActiveStory({ roomId, nodeId });
    } catch (error) {
      console.error("Failed to set active story:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
        >
          <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="font-medium">
            {activeStory
              ? `#${activeStory.data.githubIssueNumber} - ${activeStory.data.title.substring(0, 30)}${activeStory.data.title.length > 30 ? "..." : ""}`
              : "Select Story"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        {storyNodes.map((node) => {
          const isActive = node.nodeId === activeStoryNodeId;
          return (
            <DropdownMenuItem
              key={node.nodeId}
              onClick={() => handleStorySelect(node.nodeId)}
              className={`cursor-pointer p-3 ${
                isActive ? "bg-purple-50 dark:bg-purple-950/30" : ""
              }`}
            >
              <div className="flex items-start gap-2 w-full">
                {isActive ? (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="h-4 w-4 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    #{node.data.githubIssueNumber} {node.data.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {node.data.description || "No description"}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
