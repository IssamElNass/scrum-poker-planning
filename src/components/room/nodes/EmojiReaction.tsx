"use client";

import { EMOJI_ANIMATIONS } from "@/lib/lottie-animations";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import { FC, useEffect, useState } from "react";
import type { ActiveEmojiReaction } from "../types";

interface EmojiReactionProps {
  reaction: ActiveEmojiReaction;
}

export const EmojiReaction: FC<EmojiReactionProps> = ({ reaction }) => {
  const [isPopping, setIsPopping] = useState(true); // Start with pop-in
  const [shouldPopOut, setShouldPopOut] = useState(false);

  useEffect(() => {
    // Pop-in animation completes after 200ms
    const popInTimer = setTimeout(() => {
      setIsPopping(false);
    }, 200);

    // Start pop-out animation 300ms before expiry (at 2700ms)
    const popOutTimer = setTimeout(() => {
      setShouldPopOut(true);
    }, 2700);

    return () => {
      clearTimeout(popInTimer);
      clearTimeout(popOutTimer);
    };
  }, [reaction.id]);

  return (
    <div
      className={cn(
        isPopping && "animate-emoji-pop-in",
        shouldPopOut && "animate-emoji-pop-out"
      )}
      aria-label={`Reacting with ${EMOJI_ANIMATIONS[reaction.emojiType].name}`}
    >
      <Lottie
        animationData={EMOJI_ANIMATIONS[reaction.emojiType].animation}
        loop={true}
        style={{ width: 64, height: 64 }}
      />
    </div>
  );
};
