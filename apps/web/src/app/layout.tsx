import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Hostel Allocation & Roommate Matching Engine',
  description: 'Policy-Driven University Hostel Allocation Engine with Roommate Compatibility',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
