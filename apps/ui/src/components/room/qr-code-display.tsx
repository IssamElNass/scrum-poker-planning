"use client";

import { Download, QrCode, X } from "lucide-react";
import * as QRCodeJS from "qrcode";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  url: string;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export const QRCodeDisplay: FC<QRCodeDisplayProps> = ({
  url,
  roomName,
  isOpen,
  onClose,
  isMobile = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  const generateQRCode = useCallback(async () => {
    if (!url) return;

    setIsGenerating(true);

    try {
      // Generate data URL for download first
      const dataUrl = await QRCodeJS.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [url, toast]);

  // Generate QR to canvas when it becomes available
  useEffect(() => {
    if (canvasRef.current && !isGenerating && qrCodeDataUrl && url) {
      QRCodeJS.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).catch((error) => {
        console.error("Failed to render QR code to canvas:", error);
      });
    }
  }, [isGenerating, qrCodeDataUrl, url]);

  useEffect(() => {
    if (isOpen) {
      // Reset states when opening
      setQrCodeDataUrl("");
      generateQRCode();
    }
  }, [isOpen, generateQRCode]);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.download = `${roomName || "room"}-qr-code.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been saved to your device",
    });
  };

  // Desktop: Fixed position in bottom-left corner
  if (!isMobile) {
    if (!isOpen) return null;

    return (
      <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Room QR Code
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
            aria-label="Close QR code"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-3">
          {isGenerating && (
            <div className="w-[200px] h-[200px] border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generating...
                </p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`border border-gray-200 dark:border-gray-600 rounded-lg ${isGenerating ? "hidden" : "block"}`}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {isGenerating
              ? "Preparing QR code..."
              : `Scan to join ${roomName || "this room"}`}
          </p>
          <Button
            onClick={handleDownload}
            size="sm"
            className="w-full"
            disabled={!qrCodeDataUrl || isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </div>
    );
  }

  // Mobile: Dialog/Modal popup
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Room QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {isGenerating && (
            <div className="w-[200px] h-[200px] border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generating...
                </p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`border border-gray-200 dark:border-gray-600 rounded-lg ${isGenerating ? "hidden" : "block"}`}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {isGenerating
              ? "Preparing QR code..."
              : `Scan to join ${roomName || "this room"}`}
          </p>
          <Button
            onClick={handleDownload}
            className="w-full"
            disabled={!qrCodeDataUrl || isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
