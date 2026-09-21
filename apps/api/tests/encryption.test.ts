import { describe, it, expect } from 'vitest';
import { EncryptionService, EnvKeyProvider } from '../src/services/EncryptionService.js';

describe('EncryptionService (AES-256-GCM)', () => {
  const provider = new EnvKeyProvider();
  provider.registerKey('v1', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
  provider.setActiveVersion('v1');

  const service = new EncryptionService(provider);

  it('successfully encrypts and decrypts sensitive string', () => {
    const plaintext = JSON.stringify({ sleepSchedule: 'EARLY_BIRD', cleanlinessLevel: 5 });
    const encrypted = service.encrypt(plaintext);

    expect(encrypted).toMatch(/^enc:v1:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('generates unique ciphertexts for identical plaintexts due to random IV', () => {
    const plaintext = 'identical-secret-value';
    const enc1 = service.encrypt(plaintext);
    const enc2 = service.encrypt(plaintext);

    expect(enc1).not.toBe(enc2);
    expect(service.decrypt(enc1)).toBe(plaintext);
    expect(service.decrypt(enc2)).toBe(plaintext);
  });

  it('enforces AAD authentication and rejects tampered AAD', () => {
    const plaintext = 'sensitive-lifestyle-answers';
    const studentId = 'student-12345';
    const encrypted = service.encrypt(plaintext, studentId);

    // Decrypting with correct AAD succeeds
    expect(service.decrypt(encrypted, studentId)).toBe(plaintext);

    // Decrypting with wrong AAD fails
    expect(() => service.decrypt(encrypted, 'student-99999')).toThrow();
  });

  it('rejects tampered ciphertext', () => {
    const plaintext = 'test-lifestyle-data';
    const encrypted = service.encrypt(plaintext);
    const parts = encrypted.split(':');

    // Tamper with the ciphertext byte
    const tamperedCipher = parts[4]!.substring(0, parts[4]!.length - 2) + '00';
    const tamperedEnc = `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:${tamperedCipher}`;

    expect(() => service.decrypt(tamperedEnc)).toThrow();
  });

  it('supports zero-downtime key rotation across versions', () => {
    // Encrypt with v1
    const plaintext = 'data-to-rotate';
    const encV1 = service.encrypt(plaintext);
    expect(encV1.startsWith('enc:v1:')).toBe(true);

    // Register v2 and make it active
    provider.registerKey('v2', 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210');
    provider.setActiveVersion('v2');

    // Rotate existing v1 ciphertext to v2
    const encV2 = service.rotate(encV1);
    expect(encV2.startsWith('enc:v2:')).toBe(true);
    expect(service.decrypt(encV2)).toBe(plaintext);

    // Old v1 ciphertext can still be decrypted by v1 key
    expect(service.decrypt(encV1)).toBe(plaintext);
  });
});
