import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

// Get encryption key from environment
let ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY;

// If no key is provided, use a consistent default one (not secure for production)
// WARNING: Using a default key means messages can be decrypted by anyone with access to the code
if (!ENCRYPTION_KEY) {
  console.warn('⚠️  WARNING: CHAT_ENCRYPTION_KEY not found in environment variables.');
  console.warn('   Using a default encryption key. This is NOT secure for production!');
  console.warn('   All messages encrypted with this key can be decrypted by anyone.');
  console.warn('   Please set CHAT_ENCRYPTION_KEY in your .env file with at least 32 characters.');
  console.warn('   Example: CHAT_ENCRYPTION_KEY=your-secret-key-at-least-32-characters-long');
  // Use a consistent default key (not secure, but allows decryption of existing messages)
  // DO NOT use Date.now() as it changes on every restart!
  ENCRYPTION_KEY = 'default-chat-encryption-key-not-secure-change-in-production-DO-NOT-USE-IN-PRODUCTION';
}

if (ENCRYPTION_KEY.length < 32) {
  console.warn('⚠️  Warning: CHAT_ENCRYPTION_KEY is less than 32 characters. Padding the key deterministically.');
  // Pad the key deterministically using a hash of the key itself
  // This ensures the same key always produces the same padded key
  const hash = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest('hex');
  ENCRYPTION_KEY = ENCRYPTION_KEY + hash;
  // Take first 64 characters (32 bytes) to ensure consistent length
  ENCRYPTION_KEY = ENCRYPTION_KEY.substring(0, 64);
}

// Derive a consistent key from the environment key
const getKey = (): Buffer => {
  return crypto.scryptSync(ENCRYPTION_KEY!, 'salt', KEY_LENGTH);
};

/**
 * Encrypts a message using AES-256-GCM
 * @param message - Plain text message to encrypt
 * @returns Base64 encoded encrypted message with IV and auth tag
 */
export const encryptMessage = (message: string): string => {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag();

    // Combine IV, tag, and encrypted data
    // Format: base64(iv:tag:encrypted)
    const combined = Buffer.concat([
      iv,
      tag,
      Buffer.from(encrypted, 'base64'),
    ]).toString('base64');

    return combined;
  } catch (error) {
    console.error('Error encrypting message:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypts a message using AES-256-GCM
 * @param encrypted - Base64 encoded encrypted message with IV and auth tag
 * @returns Decrypted plain text message
 */
export const decryptMessage = (encrypted: string): string => {
  try {
    // Check if encrypted string is valid
    if (!encrypted || typeof encrypted !== 'string') {
      throw new Error('Invalid encrypted message format');
    }

    const key = getKey();
    const combined = Buffer.from(encrypted, 'base64');

    // Validate buffer size (must be at least IV + TAG length)
    const minSize = IV_LENGTH + TAG_LENGTH;
    if (combined.length < minSize) {
      throw new Error(`Encrypted message too short. Expected at least ${minSize} bytes, got ${combined.length}`);
    }

    // Extract IV, tag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encryptedData = combined.subarray(IV_LENGTH + TAG_LENGTH);

    if (encryptedData.length === 0) {
      throw new Error('No encrypted data found');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    console.error('Error decrypting message:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      encryptedLength: encrypted?.length,
    });
    throw new Error(`Failed to decrypt message: ${error.message}`);
  }
};

