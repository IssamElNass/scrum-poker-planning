"use client";

import { SocketProvider } from "./socket-provider";
import { AuthProvider } from "./auth/auth-provider";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <ThemeProvider 
        defaultTheme="system" 
        storageKey="pokerplanning-theme" 
        attribute="class"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </SocketProvider>
  );
}