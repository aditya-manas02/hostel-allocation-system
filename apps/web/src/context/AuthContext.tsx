'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '@hostel/shared';
import { API_BASE } from '../lib/api';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  assignedHostelId?: string;
  assignedHostelName?: string;
  studentRollNumber?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

export const DEMO_USERS: Record<Role, UserSession> = {
  STUDENT: {
    id: 'student-001',
    email: 'student@university.edu',
    fullName: 'Aditya Manas',
    role: 'STUDENT',
    studentRollNumber: '12326241',
  },
  WARDEN: {
    id: 'warden-001',
    email: 'warden.tagore@university.edu',
    fullName: 'Dr. R. K. Verma',
    role: 'WARDEN',
    assignedHostelId: 'hostel-tb',
    assignedHostelName: 'Tagore Bhawan (TB)',
  },
  CHIEF_WARDEN: {
    id: 'chief-warden-001',
    email: 'chief.warden@university.edu',
    fullName: 'Prof. S. K. Roy',
    role: 'CHIEF_WARDEN',
  },
  ADMIN: {
    id: 'admin-001',
    email: 'admin@university.edu',
    fullName: 'System Administrator',
    role: 'ADMIN',
  },
  DEAN: {
    id: 'dean-001',
    email: 'dean@university.edu',
    fullName: 'Dr. Ananya Sen (Dean of Student Welfare)',
    role: 'DEAN',
  },
  SYSTEM_ADMIN: {
    id: 'sysadmin-001',
    email: 'admin@university.edu',
    fullName: 'System Administrator',
    role: 'SYSTEM_ADMIN',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const savedUser = localStorage.getItem('hostel_user');
    const savedToken = localStorage.getItem('hostel_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error('Failed to parse saved session', e);
      }
    } else {
      // Default to Student for demo ease
      setUser(DEMO_USERS.STUDENT);
      setToken('demo-jwt-token-student');
      localStorage.setItem('hostel_user', JSON.stringify(DEMO_USERS.STUDENT));
      localStorage.setItem('hostel_token', 'demo-jwt-token-student');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string = 'Password123!'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Attempt backend login
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const sessionUser: UserSession = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          role: data.user.role,
          assignedHostelId: data.user.assignedHostelId,
        };
        setUser(sessionUser);
        setToken(data.accessToken);
        localStorage.setItem('hostel_user', JSON.stringify(sessionUser));
        localStorage.setItem('hostel_token', data.accessToken);
        setIsLoading(false);
        return true;
      }
    } catch {
      console.warn('Backend login endpoint unavailable, falling back to matching demo user');
    }

    // Fallback: match by email or default to matching role
    const matched = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    const fallbackUser = matched || DEMO_USERS.STUDENT;
    const fallbackToken = `demo-token-${fallbackUser.role.toLowerCase()}`;

    setUser(fallbackUser);
    setToken(fallbackToken);
    localStorage.setItem('hostel_user', JSON.stringify(fallbackUser));
    localStorage.setItem('hostel_token', fallbackToken);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hostel_user');
    localStorage.removeItem('hostel_token');
  };

  const switchRole = (role: Role) => {
    const demo = DEMO_USERS[role];
    if (demo) {
      setUser(demo);
      const fakeToken = `demo-token-${role.toLowerCase()}`;
      setToken(fakeToken);
      localStorage.setItem('hostel_user', JSON.stringify(demo));
      localStorage.setItem('hostel_token', fakeToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
