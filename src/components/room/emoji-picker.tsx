"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import {
  EMOJI_ANIMATIONS,
  EMOJI_TYPES,
  EmojiType,
} from "@/lib/lottie-animations";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import Lottie from "lottie-react";
import { Smile } from "lucide-react";
import { FC, useState } from "react";
import { useEmojiReactions } from "./emoji-reactions-provider";

interface EmojiPickerProps {
  roomId: Id<"rooms">;
  userId: Id<"users">;
  userName: string;
  className?: string;
}

export const EmojiPicker: FC<EmojiPickerProps> = ({
  roomId,
  userId,
  userName,
  className,
}) => {
  const { toast } = useToast();
  const { addReaction } = useEmojiReactions();
  const broadcastReaction = useMutation(api.reactions.broadcastReaction);
  const [isOpen, setIsOpen] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiType | null>(null);

  const isOnCooldown = Date.now() < cooldownUntil;

  const handleEmojiClick = async (emojiType: EmojiType) => {
    if (isOnCooldown) {
      const secondsLeft = Math.ceil((cooldownUntil - Date.now()) / 1000);
      toast({
        title: "Slow down!",
        description: `Please wait ${secondsLeft} more second${secondsLeft !== 1 ? "s" : ""}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Immediately add to local state for instant feedback
      addReaction(userId, userName, emojiType);

      // Broadcast to other clients via Convex
      await broadcastReaction({
        roomId,
        userId,
        emojiType,
      });

      // Set cooldown (2.5 seconds)
      setCooldownUntil(Date.now() + 2500);

      // Close the picker
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to send reaction:", error);
      toast({
        title: "Failed to send reaction",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors",
            isOnCooldown && "opacity-50 cursor-not-allowed",
            className
          )}
          aria-label="React with emoji"
          disabled={isOnCooldown}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg"
      >
        <div className="mb-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            React with an emoji
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {EMOJI_TYPES.map((emojiType) => {
            const emoji = EMOJI_ANIMATIONS[emojiType];
            return (
              <button
                key={emojiType}
                onClick={() => handleEmojiClick(emojiType)}
                onMouseEnter={() => setHoveredEmoji(emojiType)}
                onMouseLeave={() => setHoveredEmoji(null)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={isOnCooldown}
                aria-label={`React with ${emoji.name}`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {hoveredEmoji === emojiType ? (
                    <Lottie
                      animationData={emoji.animation}
                      loop={true}
                      style={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <span className="text-3xl">{emoji.icon}</span>
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {emoji.name}
                </span>
              </button>
            );
          })}
        </div>
        {isOnCooldown && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Cooldown: {Math.ceil((cooldownUntil - Date.now()) / 1000)}s
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
