import { Role } from '@hostel/shared';

export interface ISSOUserProfile {
  externalId: string;
  email: string;
  fullName: string;
  role: Role;
  assignedHostelId?: string;
}

export interface ISSOAdapter {
  providerName: string;
  getAuthorizationUrl(state: string, redirectUri: string): Promise<string>;
  authenticate(code: string, redirectUri: string): Promise<ISSOUserProfile>;
}

/**
 * Stub SSO Adapter for OIDC / SAML integration in university enterprise environments.
 * Local authentication is implemented by default for development and staging.
 */
export class StubSSOAdapter implements ISSOAdapter {
  public providerName = 'University-OIDC-Stub';

  async getAuthorizationUrl(state: string, redirectUri: string): Promise<string> {
    return `${redirectUri}?code=stub-auth-code&state=${encodeURIComponent(state)}`;
  }

  async authenticate(code: string, _redirectUri: string): Promise<ISSOUserProfile> {
    if (!code) {
      throw new Error('SSO Authentication failed: missing authorization code');
    }

    return {
      externalId: 'sso-user-1001',
      email: 'sso.student@university.edu',
      fullName: 'SSO Test Student',
      role: 'STUDENT',
    };
  }
}
