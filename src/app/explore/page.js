'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function Explore() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    }

    fetchPublicEvents();
  }, []);

  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans pb-24">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
           <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Explore Soups</h1>
           <p className="text-stone-text/70 text-lg">Discover public events and see what your community is cooking up.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-stone-sage font-bold animate-pulse">Loading pots...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-stone-sage-light/30 text-center">
                <p className="text-stone-text/60 mb-4">No public soups right now.</p>
                <Link href="/" className="text-stone-terracotta font-bold hover:underline">Start the first one!</Link>
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-stone-sage-light/40 overflow-hidden flex flex-col hover:border-stone-terracotta/30 transition-colors group cursor-pointer">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className={`inline-block self-start px-2 py-1 font-bold text-[10px] uppercase tracking-widest rounded mb-3 ${
                      event.status === 'Ready' ? 'bg-stone-sage/10 text-stone-sage' : 'bg-stone-terracotta/10 text-stone-terracotta'
                    }`}>
                      {event.status}
                    </div>
                    <Link href={`/soup/${event.id}`} className="hover:underline decoration-stone-terracotta/30 underline-offset-4">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-stone-terracotta transition-colors">{event.stone}</h3>
                    </Link>
                    <p className="text-sm text-stone-text/70 mb-4 line-clamp-2 flex-1">{event.description}</p>
                    <div className="text-sm text-stone-text/60 flex items-center gap-2 pt-4 border-t border-stone-sage-light/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-sage shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span className="truncate">{event.pot}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
