export type VotingSystemType =
  | "fibonacci"
  | "modified-fibonacci"
  | "tshirt"
  | "powers-of-2";

export interface VotingSystemDef {
  id: VotingSystemType;
  name: string;
  description: string;
  cards: string[];
}

export const VOTING_SYSTEMS: Record<VotingSystemType, VotingSystemDef> = {
  fibonacci: {
    id: "fibonacci",
    name: "Classic Fibonacci",
    description: "Standard Fibonacci sequence for story points",
    cards: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"],
  },
  "modified-fibonacci": {
    id: "modified-fibonacci",
    name: "Modified Fibonacci",
    description: "Classic Scrum deck with half-point and larger estimates",
    cards: ["0", "½", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"],
  },
  tshirt: {
    id: "tshirt",
    name: "T-shirt Sizes",
    description: "Easy for non-technical stakeholders",
    cards: ["XS", "S", "M", "L", "XL", "XXL", "?"],
  },
  "powers-of-2": {
    id: "powers-of-2",
    name: "Powers of 2",
    description: "Simple binary progression that grows fast",
    cards: ["1", "2", "4", "8", "16", "32", "64", "128", "?"],
  },
};

// Default voting system
export const DEFAULT_VOTING_SYSTEM: VotingSystemType = "fibonacci";

// Helper function to get cards for a voting system
export function getVotingSystemCards(systemType: VotingSystemType): string[] {
  return (
    VOTING_SYSTEMS[systemType]?.cards ||
    VOTING_SYSTEMS[DEFAULT_VOTING_SYSTEM].cards
  );
}

// Helper function to get voting system info
export function getVotingSystem(systemType: VotingSystemType): VotingSystemDef {
  return VOTING_SYSTEMS[systemType] || VOTING_SYSTEMS[DEFAULT_VOTING_SYSTEM];
}

