import clapAnimation from "./clap.json";
import fireAnimation from "./fire.json";
import heartAnimation from "./heart.json";
import partyAnimation from "./party.json";
import thinkingAnimation from "./thinking.json";
import thumbsUpAnimation from "./thumbs-up.json";

export type EmojiType =
  | "thumbsUp"
  | "heart"
  | "clap"
  | "fire"
  | "thinking"
  | "party";

export interface EmojiAnimation {
  type: EmojiType;
  name: string;
  animation: any;
  icon: string;
}

export const EMOJI_ANIMATIONS: Record<EmojiType, EmojiAnimation> = {
  thumbsUp: {
    type: "thumbsUp",
    name: "Thumbs Up",
    animation: thumbsUpAnimation,
    icon: "👍",
  },
  heart: {
    type: "heart",
    name: "Heart",
    animation: heartAnimation,
    icon: "❤️",
  },
  clap: {
    type: "clap",
    name: "Clap",
    animation: clapAnimation,
    icon: "👏",
  },
  fire: {
    type: "fire",
    name: "Fire",
    animation: fireAnimation,
    icon: "🔥",
  },
  thinking: {
    type: "thinking",
    name: "Thinking",
    animation: thinkingAnimation,
    icon: "🤔",
  },
  party: {
    type: "party",
    name: "Party",
    animation: partyAnimation,
    icon: "🎉",
  },
};

export const EMOJI_TYPES: EmojiType[] = [
  "thumbsUp",
  "heart",
  "clap",
  "fire",
  "thinking",
  "party",
];
