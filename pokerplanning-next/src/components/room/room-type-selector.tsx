"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoomTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (roomType: "classic" | "canvas") => void;
}

export function RoomTypeSelector({ open, onClose, onSelect }: RoomTypeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Room Type</DialogTitle>
          <DialogDescription>
            Select the type of planning poker room you&apos;d like to create.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <button
            onClick={() => {
              onClose();
              onSelect("classic");
            }}
            className="text-left space-y-2 p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold">Classic Room</h3>
            <p className="text-sm text-muted-foreground">
              Traditional planning poker with a circular table layout. Perfect for mobile devices and quick sessions.
            </p>
          </button>
          <button
            onClick={() => {
              onClose();
              onSelect("canvas");
            }}
            className="text-left space-y-2 p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Canvas Room</h3>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Beta</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern whiteboard-style interface with endless canvas. Includes floating navigation and advanced features.
            </p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}