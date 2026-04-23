'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [mySoups, setMySoups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      // 1. Get User
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // 2. Fetch Events for this user
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .eq('cook_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!error && events) {
          setMySoups(events);
        }
      }
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const handleTogglePublic = async (eventId, currentStatus) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ is_public: !currentStatus })
        .eq('id', eventId)
        .select();

      if (error) throw error;
      
      setMySoups(mySoups.map(event => 
        event.id === eventId ? data[0] : event
      ));
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update event status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-cream flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-sage font-bold animate-pulse">Loading your kitchen...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-cream flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-stone-text/70 mb-6">You need to be logged in to view your dashboard.</p>
            <Link href="/publish" className="bg-stone-sage text-white px-6 py-3 rounded-xl font-semibold hover:bg-stone-sage-dark transition-colors">
               Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans pb-24">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 flex justify-between items-end">
           <div>
             <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Your Dashboard</h1>
             <p className="text-stone-text/70 text-lg">Here's what's cooking in your pots.</p>
           </div>
           <Link href="/" className="text-sm font-semibold bg-stone-terracotta text-white px-4 py-2 rounded-lg transition-colors hover:bg-stone-terracotta-dark shadow-sm hidden sm:block">
             + Start a new Soup
           </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Column: Hosting */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold border-b border-stone-sage-light/30 pb-3 flex items-center justify-between">
              My Soups <span className="text-sm font-normal text-stone-text/50">Events you are hosting</span>
            </h2>

            {mySoups.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone-sage-light/30 text-center">
                <p className="text-stone-text/60 mb-4">You aren't hosting any events yet.</p>
                <Link href="/" className="text-stone-terracotta font-bold hover:underline">Create one now</Link>
              </div>
            ) : (
              mySoups.map(event => (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-stone-sage-light/40 overflow-hidden mb-6">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className={`inline-block px-2 py-1 font-bold text-[10px] uppercase tracking-widest rounded mb-2 mr-2 ${
                          event.status === 'Ready' ? 'bg-stone-sage/10 text-stone-sage' : 'bg-stone-terracotta/10 text-stone-terracotta'
                        }`}>
                          {event.status}
                        </div>
                        <div className={`inline-block px-2 py-1 font-bold text-[10px] uppercase tracking-widest rounded mb-2 ${
                          event.is_public ? 'bg-blue-100 text-blue-700' : 'bg-stone-text/10 text-stone-text/70'
                        }`}>
                          {event.is_public ? 'Public' : 'Private'}
                        </div>
                        <Link href={`/soup/${event.id}`} className="hover:underline decoration-stone-terracotta/30 underline-offset-4">
                          <h3 className="text-2xl font-bold">{event.stone}</h3>
                        </Link>
                        <p className="text-sm text-stone-text/60 mt-1">{event.pot}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Link href={`/soup/${event.id}`} className="text-sm font-medium text-stone-sage hover:text-stone-sage-dark bg-stone-paper px-3 py-1.5 rounded-lg border border-stone-sage-light/30 whitespace-nowrap text-center w-full">
                          Tweak the recipe
                        </Link>
                        <button 
                          onClick={() => handleTogglePublic(event.id, event.is_public)}
                          className="text-xs font-medium text-stone-text/60 hover:text-stone-text underline"
                        >
                          Make {event.is_public ? 'Private' : 'Public'}
                        </button>
                      </div>
                    </div>
                    {!event.is_public && (
                      <div className="mt-4 pt-4 border-t border-stone-sage-light/20">
                         <p className="text-xs text-stone-text/70 mb-1">Private Event Link (Share this with guests):</p>
                         <code className="text-xs bg-stone-paper p-2 rounded block select-all overflow-x-auto">
                           {typeof window !== 'undefined' ? `${window.location.origin}/soup/${event.id}` : `/soup/${event.id}`}
                         </code>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Right Column: Attending (Placeholder for MVP) */}
          <div className="space-y-8">
             <h2 className="text-2xl font-bold border-b border-stone-sage-light/30 pb-3 flex items-center justify-between">
              My Pledges
            </h2>

            <div className="space-y-4">
              <div className="bg-stone-paper/50 p-5 rounded-xl border border-stone-sage-light/30">
                 <p className="text-sm text-stone-text/60 italic text-center py-4">
                   Pledge tracking coming soon!
                 </p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
