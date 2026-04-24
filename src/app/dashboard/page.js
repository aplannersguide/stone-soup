'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [mySoups, setMySoups] = useState([]);
  const [myPledges, setMyPledges] = useState([]);
  const [guestName, setGuestName] = useState(null);
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

      // 3. Get Guest Name and Pledges
      const gName = localStorage.getItem('stoneSoupGuestName');
      if (gName) {
        setGuestName(gName);
        const { data: pledges, error: pledgesError } = await supabase
          .from('ingredients')
          .select('*, events(id, stone, event_date, event_time, status)')
          .eq('claimed_by_name', gName)
          .neq('status', 'open')
          .order('created_at', { ascending: false });

        if (!pledgesError && pledges) {
          setMyPledges(pledges);
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

  const handleTossSoup = async (eventId, stoneName) => {
    const confirmed = window.confirm(`Are you sure you want to toss out "${stoneName}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      // Delete ingredients first (if foreign keys don't cascade)
      await supabase.from('ingredients').delete().eq('event_id', eventId);

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setMySoups(mySoups.filter(event => event.id !== eventId));
    } catch (err) {
      console.error("Error tossing soup:", err);
      alert("Failed to toss out the soup.");
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
                        <div className={`inline-block px-2 py-1 font-bold text-[10px] uppercase tracking-widest rounded mb-2 mr-2 ${event.status === 'Ready' ? 'bg-stone-sage/10 text-stone-sage' : 'bg-stone-terracotta/10 text-stone-terracotta'
                          }`}>
                          {event.status}
                        </div>
                        <div className={`inline-block px-2 py-1 font-bold text-[10px] uppercase tracking-widest rounded mb-2 ${event.is_public ? 'bg-blue-100 text-blue-700' : 'bg-stone-text/10 text-stone-text/70'
                          }`}>
                          {event.is_public ? 'Public' : 'Private'}
                        </div>
                        <Link href={`/soup/${event.id}`} className="hover:underline decoration-stone-terracotta/30 underline-offset-4">
                          <h3 className="text-2xl font-bold">{event.stone}</h3>
                        </Link>
                        <p className="text-sm text-stone-text/60 mt-1">{event.location} • {event.event_date} {event.event_time}</p>
                      </div>
                      <div className="flex flex-col gap-2.5 items-end w-full sm:w-32">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePublic(event.id, event.is_public)}
                            title={event.is_public ? 'Currently Public - Click to make Private' : 'Currently Private - Click to make Public'}
                            className={`p-2 rounded-xl border transition-all shadow-sm ${
                              event.is_public 
                                ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' 
                                : 'bg-stone-paper text-stone-text/40 border-stone-sage-light/40 hover:bg-white'
                            }`}
                          >
                            {event.is_public ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V7a5 5 0 0 1 9.9-1"></path><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            )}
                          </button>

                          <button
                            onClick={() => handleTossSoup(event.id, event.stone)}
                            title="Toss the Soup"
                            className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all shadow-sm"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                          <Link href={`/soup/${event.id}`} className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-stone-sage-dark bg-white hover:bg-stone-sage/10 px-2.5 py-2 rounded-xl border border-stone-sage-light/40 transition-all shadow-sm w-full whitespace-nowrap">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Tweak
                          </Link>
                          
                          <Link href={`/?clone=${event.id}`} className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-stone-terracotta-dark bg-white hover:bg-stone-terracotta/10 px-2.5 py-2 rounded-xl border border-stone-terracotta/30 transition-all shadow-sm w-full whitespace-nowrap">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy
                          </Link>
                        </div>
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

          {/* Right Column: Attending */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-stone-sage-light/30 pb-3 flex items-center justify-between">
              My Pledges
            </h2>

            <div className="space-y-4">
              {!guestName || myPledges.length === 0 ? (
                <div className="bg-stone-paper/50 p-5 rounded-xl border border-stone-sage-light/30">
                  <p className="text-sm text-stone-text/60 text-center py-4">
                    You haven't made any pledges yet.
                  </p>
                </div>
              ) : (
                myPledges.map(pledge => (
                  <div key={pledge.id} className="bg-white p-5 rounded-xl border border-stone-sage-light/30 shadow-sm relative group overflow-hidden">
                    {pledge.events?.status === 'Completed' && (
                      <div className="absolute top-0 right-0 bg-stone-terracotta text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-bl z-10">
                        Completed
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-stone-sage/10 text-stone-sage-dark flex items-center justify-center shrink-0">
                         <span className="font-bold text-xs">{guestName.substring(0, 2).toUpperCase()}</span>
                       </div>
                       <div>
                         <p className="text-xs text-stone-text/70">You are bringing:</p>
                         <h4 className="font-bold text-stone-terracotta-dark leading-tight">{pledge.title}</h4>
                       </div>
                    </div>
                    {pledge.events && (
                      <div className="mt-3 pt-3 border-t border-stone-sage-light/20">
                        <p className="text-xs text-stone-text/60 mb-1">For event:</p>
                        <Link href={`/soup/${pledge.events.id}`} className="block font-bold text-sm hover:underline decoration-stone-terracotta/30">
                          {pledge.events.stone}
                        </Link>
                        <p className="text-xs text-stone-text/50 mt-1">{pledge.events.event_date} {pledge.events.event_time}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
