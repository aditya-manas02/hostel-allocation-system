import crypto from 'node:crypto';
import { env } from '../config/env.js';

export interface IKeyProvider {
  getKey(version: string): Buffer | null;
  getActiveVersion(): string;
}

export class EnvKeyProvider implements IKeyProvider {
  private keys: Map<string, Buffer> = new Map();
  private activeVersion: string;

  constructor() {
    this.activeVersion = env.ENCRYPTION_KEY_ACTIVE_VERSION;
    if (env.ENCRYPTION_KEY_V1) {
      this.keys.set('v1', Buffer.from(env.ENCRYPTION_KEY_V1, 'hex'));
    }
  }

  public registerKey(version: string, keyHex: string): void {
    if (keyHex.length !== 64) {
      throw new Error('Encryption key must be 32 bytes (64 hex characters)');
    }
    this.keys.set(version, Buffer.from(keyHex, 'hex'));
  }

  public setActiveVersion(version: string): void {
    if (!this.keys.has(version)) {
      throw new Error(`Cannot set active key version to unregistered version: ${version}`);
    }
    this.activeVersion = version;
  }

  public getKey(version: string): Buffer | null {
    return this.keys.get(version) || null;
  }

  public getActiveVersion(): string {
    return this.activeVersion;
  }
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96-bit IV
  private static readonly TAG_LENGTH = 16; // 128-bit auth tag

  private keyProvider: IKeyProvider;

  constructor(keyProvider?: IKeyProvider) {
    this.keyProvider = keyProvider || new EnvKeyProvider();
  }

  /**
   * Encrypts plaintext data using AES-256-GCM.
   * Returns formatted string: enc:<version>:<ivHex>:<tagHex>:<cipherHex>
   */
  public encrypt(plaintext: string, aad?: string): string {
    const version = this.keyProvider.getActiveVersion();
    const key = this.keyProvider.getKey(version);
    if (!key) {
      throw new Error(`Encryption key for active version '${version}' is not available.`);
    }

    const iv = crypto.randomBytes(EncryptionService.IV_LENGTH);
    const cipher = crypto.createCipheriv(EncryptionService.ALGORITHM, key, iv, {
      authTagLength: EncryptionService.TAG_LENGTH,
    });

    if (aad) {
      cipher.setAAD(Buffer.from(aad, 'utf8'));
    }

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return `enc:${version}:${iv.toString('hex')}:${tag}:${ciphertext}`;
  }

  /**
   * Decrypts ciphertext formatted as: enc:<version>:<ivHex>:<tagHex>:<cipherHex>
   */
  public decrypt(encryptedStr: string, aad?: string): string {
    if (!encryptedStr.startsWith('enc:')) {
      throw new Error('Invalid encrypted string format: missing enc prefix');
    }

    const parts = encryptedStr.split(':');
    if (parts.length !== 5) {
      throw new Error('Invalid encrypted string structure: expected enc:<version>:<iv>:<tag>:<ciphertext>');
    }

    const [, version, ivHex, tagHex, ciphertextHex] = parts;
    const key = this.keyProvider.getKey(version!);
    if (!key) {
      throw new Error(`Encryption key for version '${version}' is not available.`);
    }

    const iv = Buffer.from(ivHex!, 'hex');
    const tag = Buffer.from(tagHex!, 'hex');
    const decipher = crypto.createDecipheriv(EncryptionService.ALGORITHM, key, iv, {
      authTagLength: EncryptionService.TAG_LENGTH,
    });

    decipher.setAuthTag(tag);
    if (aad) {
      decipher.setAAD(Buffer.from(aad, 'utf8'));
    }

    let decrypted = decipher.update(ciphertextHex!, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Re-encrypts ciphertext with the active key version for key rotation.
   */
  public rotate(encryptedStr: string, aad?: string): string {
    const decrypted = this.decrypt(encryptedStr, aad);
    return this.encrypt(decrypted, aad);
  }
}

export const defaultEncryptionService = new EncryptionService();
