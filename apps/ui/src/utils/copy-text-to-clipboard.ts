export async function copyTextToClipboard(text: string): Promise<boolean> {
  if ("clipboard" in navigator) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Handle permission denied, not allowed errors, etc.
      console.warn("Clipboard access failed:", error);
      return false;
    }
  } else {
    return false;
  }
}
