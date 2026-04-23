'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import IngredientCard from '@/components/IngredientCard';

export default function DynamicEventPage() {
  const params = useParams();
  const eventId = params.id;

  const [eventData, setEventData] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newSurprise, setNewSurprise] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchEventAndIngredients() {
      if (!eventId) return;

      try {
        // Fetch Event
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;
        setEventData(event);

        // Fetch Ingredients
        const { data: ings, error: ingsError } = await supabase
          .from('ingredients')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true });

        if (ingsError) throw ingsError;
        setIngredients(ings || []);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load this event. It may have been deleted or the link is invalid.");
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndIngredients();
  }, [eventId]);

  const handleAddSurprise = async () => {
    if (!newSurprise.trim() || !eventData) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([{
          event_id: eventData.id,
          title: newSurprise,
          type: 'surprise',
          status: 'pending',
          claimed_by_name: 'Guest (You)'
        }])
        .select();

      if (error) throw error;

      // Update local state to show it immediately
      setIngredients([...ingredients, data[0]]);
      setNewSurprise('');
    } catch (err) {
      console.error("Error adding surprise:", err);
      alert("Failed to add ingredient.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimNeed = async (ingredientId) => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .update({ 
          status: 'claimed',
          claimed_by_name: 'Guest (You)' 
        })
        .eq('id', ingredientId)
        .select();

      if (error) throw error;

      // Update local state
      setIngredients(ingredients.map(ing => 
        ing.id === ingredientId ? data[0] : ing
      ));
    } catch (err) {
      console.error("Error claiming need:", err);
      alert("Failed to claim ingredient.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-cream flex items-center justify-center">
        <p className="text-stone-sage font-bold animate-pulse">Warming up the pot...</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-stone-cream flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
           <div className="text-red-500 mb-4">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
           </div>
           <h1 className="text-2xl font-bold mb-2">Oops!</h1>
           <p className="text-stone-text/70 mb-6">{error || "Event not found"}</p>
           <Link href="/" className="text-stone-terracotta font-semibold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const isReady = eventData.status === 'Ready';
  const needs = ingredients.filter(i => i.type === 'need');
  const openNeedsCount = needs.filter(i => i.status === 'open').length;
  const surprises = ingredients.filter(i => i.type === 'surprise');

  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans pb-24">
      {/* Header / Navigation */}
      <header className="border-b border-stone-sage-light/30 bg-stone-paper/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
          <div className="flex items-center gap-4">
             <div className="text-sm font-medium bg-white px-3 py-1.5 rounded-full border border-stone-sage-light/30 shadow-sm text-stone-text/70">
               Viewing Public Event
             </div>
          </div>
        </div>
      </header>

      {/* The Stone (Event Info) */}
      <section className="bg-stone-paper/30 border-b border-stone-sage-light/20 relative">
        {isReady && (
          <div className="absolute top-0 left-0 w-full bg-stone-sage text-white text-center py-2 font-bold tracking-widest uppercase text-sm shadow-sm z-10">
            🍲 The Soup is Ready! See you at the feast.
          </div>
        )}
        <div className={`max-w-3xl mx-auto px-6 pb-12 sm:pb-16 text-center ${isReady ? 'pt-20' : 'pt-12 sm:pt-16'}`}>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-stone-terracotta-dark">
            {eventData.stone}
          </h1>
          {eventData.description && (
             <p className="text-lg text-stone-text/80 max-w-2xl mx-auto mb-8">
               {eventData.description}
             </p>
          )}
          
          {/* The Pot (Location/Time) */}
          <div className="flex items-center justify-center text-stone-text/70 font-medium">
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-stone-sage-light/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{eventData.pot}</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Shared Pot (Ingredient Board) */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold mb-3">{isReady ? 'The Feast Menu' : 'The Shared Pot'}</h2>
           <p className="text-stone-text/70">
             {isReady 
               ? "The pot is full! Here is what everyone is bringing." 
               : "What will you bring to the soup? Claim a need or offer a surprise."}
           </p>
        </div>

        {/* Input Area (Hidden when Ready) */}
        {!isReady && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-sage-light/30 max-w-2xl mx-auto mb-16 relative overflow-hidden transition-all">
             <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={newSurprise}
                  onChange={(e) => setNewSurprise(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSurprise()}
                  placeholder="I can bring..."
                  className="flex-1 p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50"
                  disabled={isSubmitting}
                />
                <button 
                  onClick={handleAddSurprise}
                  disabled={isSubmitting || !newSurprise.trim()}
                  className="bg-stone-sage hover:bg-[#7a8c79] disabled:opacity-50 text-white px-6 py-4 rounded-xl font-semibold shadow-sm transition-colors whitespace-nowrap"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Pot'}
                </button>
             </div>
             <p className="text-xs text-stone-text/50 mt-3 text-center">
               *Remember, things like "helping set up" or "good vibes" are perfect ingredients!
             </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Column 1: Needs / Pledges */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-stone-sage-light/30 pb-3">
               <h3 className="text-xl font-bold">{isReady ? 'Pledged Items' : 'What We Need'}</h3>
               {!isReady && openNeedsCount > 0 && <span className="bg-stone-terracotta/10 text-stone-terracotta text-xs font-bold px-2 py-1 rounded-full">{openNeedsCount} Open</span>}
            </div>

            <div className="space-y-4">
               {needs.length === 0 && (
                 <p className="text-stone-text/50 italic text-sm">No specific needs were requested.</p>
               )}
               {needs.map((need) => (
                 <IngredientCard 
                   key={need.id}
                   type="need"
                   status={need.status}
                   title={need.title}
                   claimedBy={need.claimed_by_name}
                   isReady={isReady}
                   onClaim={() => handleClaimNeed(need.id)}
                 />
               ))}
            </div>
          </div>

          {/* Column 2: Surprise Offerings */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-stone-sage-light/30 pb-3">
               <h3 className="text-xl font-bold">Surprise Ingredients</h3>
            </div>

            <div className="space-y-4">
               {surprises.length === 0 && !isReady && (
                 <p className="text-stone-text/50 italic text-sm">No surprises added yet. Be the first!</p>
               )}
               {surprises.map((surprise) => (
                 <IngredientCard 
                   key={surprise.id}
                   type="surprise"
                   title={surprise.title}
                   claimedBy={{ name: surprise.claimed_by_name }}
                 />
               ))}
               
               {/* Hidden if Ready */}
               {!isReady && surprises.length > 0 && (
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-sage-light/20 border-dashed border-2 bg-stone-paper/30 transition-opacity">
                    <div className="text-center py-4">
                       <p className="text-stone-text/60 italic mb-2">The pot has room for more...</p>
                       <span className="text-sm font-semibold text-stone-terracotta">
                          Type above to add an ingredient
                       </span>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
