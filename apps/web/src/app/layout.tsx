import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hostel Allocation & Roommate Matching',
  description: 'Policy-Driven University Hostel Allocation Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
