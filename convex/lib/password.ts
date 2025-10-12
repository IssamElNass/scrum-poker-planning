/**
 * Password hashing utilities for room passwords
 * Uses bcrypt for secure one-way hashing
 */

// Note: In Convex, we need to use a compatible bcrypt implementation
// We'll use a simple but secure approach with Web Crypto API

/**
 * Hash a password using PBKDF2 (available in Web Crypto API)
 * @param password The plain text password to hash
 * @returns The hashed password as a base64 string with salt
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt (16 bytes)
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  // Convert password to bytes
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  // Derive key using PBKDF2 with 100,000 iterations (recommended minimum)
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256 // 32 bytes
  );

  // Combine salt and hash
  const hashBytes = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hashBytes.length);
  combined.set(salt, 0);
  combined.set(hashBytes, salt.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a hash
 * @param password The plain text password to verify
 * @param hash The stored hash to compare against
 * @returns True if the password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // Decode the stored hash
    const binaryString = atob(hash);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    // Extract salt and hash
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    // Convert password to bytes
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    // Derive key using the same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const computedHash = new Uint8Array(derivedBits);

    // Compare hashes using constant-time comparison
    if (computedHash.length !== storedHash.length) {
      return false;
    }

    let mismatch = 0;
    for (let i = 0; i < computedHash.length; i++) {
      mismatch |= computedHash[i] ^ storedHash[i];
    }

    return mismatch === 0;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

/**
 * Check if a string is a hashed password (for migration purposes)
 * @param value The value to check
 * @returns True if it appears to be a hashed password
 */
export function isHashedPassword(value: string): boolean {
  // Hashed passwords will be base64 and 44+ characters long (16 byte salt + 32 byte hash = 48 bytes = 64 base64 chars)
  // But with padding, it should be exactly 64 chars
  try {
    const binaryString = atob(value);
    return binaryString.length === 48; // 16 byte salt + 32 byte hash
  } catch {
    return false;
  }
}
