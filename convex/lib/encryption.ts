/**
 * Encryption utilities for securing sensitive data like API keys
 * Uses AES-256-GCM with a key stored in Convex environment variables
 */

/**
 * Get the encryption key from environment variables
 * @returns The encryption key as a Uint8Array
 * @throws Error if the key is not set or invalid
 */
function getEncryptionKey(): Uint8Array {
  const keyHex = process.env.INTEGRATION_ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY environment variable is not set. " +
        "Generate a 32-byte hex string and set it in your Convex dashboard."
    );
  }

  // Remove any whitespace or formatting
  const cleanKey = keyHex.replace(/\s/g, "");

  // Validate hex format and length (64 hex chars = 32 bytes)
  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes)"
    );
  }

  // Convert hex string to Uint8Array
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(cleanKey.substr(i * 2, 2), 16);
  }

  return bytes;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext The data to encrypt (will be JSON stringified)
 * @returns Base64-encoded encrypted data with IV prepended
 */
export async function encrypt(plaintext: unknown): Promise<string> {
  const key = getEncryptionKey();

  // Generate a random 12-byte IV (recommended for GCM)
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  // Import the key for AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Convert plaintext to bytes
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(plaintext));

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    plaintextBytes as BufferSource
  );

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Convert to base64
  return Buffer.from(combined).toString("base64");
}

/**
 * Decrypt encrypted data
 * @param encryptedData Base64-encoded encrypted data with IV prepended
 * @returns Decrypted and parsed data
 */
export async function decrypt<T = unknown>(encryptedData: string): Promise<T> {
  const key = getEncryptionKey();

  // Decode from base64
  const combined = Buffer.from(encryptedData, "base64");

  // Extract IV and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  // Import the key for AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // Decrypt
  try {
    const plaintextBytes = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      ciphertext as BufferSource
    );

    // Convert bytes to string and parse JSON
    const decoder = new TextDecoder();
    const plaintextJson = decoder.decode(plaintextBytes);
    return JSON.parse(plaintextJson) as T;
  } catch (error) {
    throw new Error(
      `Failed to decrypt data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate a random encryption key for initial setup
 * This function is for documentation/setup purposes only
 * @returns A 32-byte hex string suitable for INTEGRATION_ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Credentials stored in encrypted form
 */
export interface IntegrationCredentials {
  // GitHub
  personalAccessToken?: string;

  // Jira
  apiToken?: string;
  username?: string;
  domain?: string;

  // Trello (future)
  apiKey?: string;
  token?: string;
}
