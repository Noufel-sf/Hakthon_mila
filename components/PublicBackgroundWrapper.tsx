'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicBackgroundWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen w-full bg-white relative flex flex-col">
      {/* Teal Glow Background - Fixed to viewport so it stays steady as you scroll */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #0E4B35 100%)
          `,
          backgroundSize: '100% 100%',
        }}
      />
      {/* Content / Components */}
      <div className="relative z-10 flex flex-col min-h-screen flex-1">
        <Navbar />
        <main className="flex-1 pb-16">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
