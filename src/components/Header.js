'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check active session
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Get user initials (default to '?')
  const getInitials = () => {
    if (!user?.email) return '?';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="border-b border-stone-sage-light/30 bg-stone-paper/50 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta group-hover:rotate-12 transition-transform">
              <path d="M4 10h16"/>
              <path d="M5 10v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-6"/>
              <path d="M2 10h2"/>
              <path d="M20 10h2"/>
              <path d="M8 5v1"/>
              <path d="M12 4v2"/>
              <path d="M16 5v1"/>
            </svg>
            <span className="font-semibold text-xl tracking-tight hidden sm:block">Stone Soup</span>
          </Link>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium">
          {/* Always show explore */}
          <Link href="/explore" className="hover:text-stone-terracotta transition-colors hidden sm:block text-stone-text/70">
            Explore
          </Link>
          
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-stone-terracotta transition-colors font-bold text-stone-terracotta">
                My Soups
              </Link>
              <div className="relative group cursor-pointer">
                <div className="h-9 w-9 rounded-full bg-stone-sage text-white flex items-center justify-center font-bold shadow-sm">
                  {getInitials()}
                </div>
                {/* Dropdown on hover */}
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-stone-sage-light/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-stone-text hover:bg-stone-cream hover:text-stone-terracotta rounded-xl transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-stone-sage/10 text-stone-sage hover:bg-stone-sage hover:text-white px-4 py-2 rounded-xl transition-colors font-bold">
                Sign In
              </Link>
            </>
          )}
        </nav>
        
      </div>
    </header>
  );
}
