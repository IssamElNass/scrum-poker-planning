"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";

interface RoomCanvasProps {
  roomData: any; // We'll type this properly when Convex types are generated
}

export function RoomCanvas({ roomData }: RoomCanvasProps) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const showCards = useMutation(api.rooms.showCards);
  const resetGame = useMutation(api.rooms.resetGame);
  const leaveRoom = useMutation(api.users.leave);
  const pickCard = useMutation(api.votes.pickCard);

  const handleLeaveRoom = async () => {
    if (!user) return;
    
    try {
      await leaveRoom({ userId: user.id });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Failed to leave room:", error);
    }
  };

  const handlePickCard = async (cardLabel: string, cardValue: number) => {
    if (!user || !roomData) return;
    
    try {
      await pickCard({
        roomId: roomData.room._id,
        userId: user.id,
        cardLabel,
        cardValue,
      });
    } catch (error) {
      console.error("Failed to pick card:", error);
    }
  };

  const handleShowCards = async () => {
    if (!roomData) return;
    
    try {
      await showCards({ roomId: roomData.room._id });
    } catch (error) {
      console.error("Failed to show cards:", error);
    }
  };

  const handleResetGame = async () => {
    if (!roomData) return;
    
    try {
      await resetGame({ roomId: roomData.room._id });
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  };

  if (!roomData || !user) {
    return <div>Loading...</div>;
  }

  const { room, users, votes } = roomData;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <p className="text-muted-foreground">Canvas Room (Beta)</p>
          </div>
          <Button variant="outline" onClick={handleLeaveRoom}>
            Leave Room
          </Button>
        </div>

        <div className="border rounded-lg p-8 bg-muted/20 min-h-[500px]">
          <p className="text-center text-muted-foreground mb-8">
            Canvas view with React Flow will be implemented here
          </p>

          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Players</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {users.map((player: any) => {
                  const vote = votes.find((v: any) => v.userId === player._id);
                  return (
                    <div key={player._id} className="p-4 border rounded-lg bg-background">
                      <div className="font-medium">{player.name}</div>
                      {player.isSpectator && <div className="text-sm text-muted-foreground">Spectator</div>}
                      {vote?.hasVoted && !room.isGameOver && <div className="text-sm text-green-600">Voted</div>}
                      {room.isGameOver && vote?.cardLabel && (
                        <div className="text-2xl font-bold mt-2">{vote.cardLabel}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Voting Cards</h2>
              {!room.isGameOver ? (
                <>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {["0", "1", "2", "3", "5", "8", "13", "21", "?"].map((card) => (
                      <Button
                        key={card}
                        variant="outline"
                        onClick={() => handlePickCard(card, parseInt(card) || 0)}
                        className="h-20 text-xl"
                      >
                        {card}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleShowCards} className="w-full">
                    Show Cards
                  </Button>
                </>
              ) : (
                <Button onClick={handleResetGame} className="w-full">
                  Start New Game
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}