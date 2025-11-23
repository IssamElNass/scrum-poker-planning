"use client";

import { Id } from "@/lib/types";
import type { EmojiType } from "@/lib/lottie-animations";
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export interface EmojiReaction {
  id: string;
  userId: Id<"users">;
  userName: string;
  emojiType: EmojiType;
  timestamp: number;
}

interface EmojiReactionsContextValue {
  reactions: EmojiReaction[];
  addReaction: (
    userId: Id<"users">,
    userName: string,
    emojiType: EmojiType
  ) => void;
  getReactionsForUser: (userId: Id<"users">) => EmojiReaction[];
}

const EmojiReactionsContext = createContext<
  EmojiReactionsContextValue | undefined
>(undefined);

interface EmojiReactionsProviderProps {
  children: ReactNode;
  roomId: Id<"rooms">;
}

const REACTION_DURATION = 3000; // 3 seconds

export const EmojiReactionsProvider: FC<EmojiReactionsProviderProps> = ({
  children,
}) => {
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);

  const addReaction = useCallback(
    (userId: Id<"users">, userName: string, emojiType: EmojiType) => {
      const newReaction: EmojiReaction = {
        id: `${userId}-${Date.now()}-${Math.random()}`,
        userId,
        userName,
        emojiType,
        timestamp: Date.now(),
      };

      setReactions((prev) => [...prev, newReaction]);

      // Auto-remove after duration - each reaction manages its own cleanup
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, REACTION_DURATION);
    },
    []
  );

  const getReactionsForUser = useCallback(
    (userId: Id<"users">) => {
      return reactions.filter((r) => r.userId === userId);
    },
    [reactions]
  );

  return (
    <EmojiReactionsContext.Provider
      value={{ reactions, addReaction, getReactionsForUser }}
    >
      {children}
    </EmojiReactionsContext.Provider>
  );
};

export const useEmojiReactions = () => {
  const context = useContext(EmojiReactionsContext);
  if (!context) {
    throw new Error(
      "useEmojiReactions must be used within EmojiReactionsProvider"
    );
  }
  return context;
};
