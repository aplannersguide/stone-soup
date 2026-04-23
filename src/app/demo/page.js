'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import IngredientCard from '../../components/IngredientCard';
import Header from '../../components/Header';

export default function EventDemo() {
  const [isReady, setIsReady] = useState(false);
  const [draft, setDraft] = useState(null);
  
  const [newIngredient, setNewIngredient] = useState('');
  const [surprises, setSurprises] = useState([]);

  useEffect(() => {
    // Read the draft event from local storage when the page loads
    const savedDraft = localStorage.getItem('stoneSoupDraft');
    if (savedDraft) {
      setDraft(JSON.parse(savedDraft));
    }
  }, []);

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setSurprises([{ name: 'You (Guest)', offering: newIngredient }, ...surprises]);
      setNewIngredient('');
    }
  };

  // Fallback data if no draft exists
  const eventData = draft || {
    stone: "Spring Swap & Social",
    description: "Bring your gently used clothes, books, and household items to trade. Even if you have nothing to swap, come for the community, the snacks, and the good vibes.",
    pot: "Sat, April 20 • 1:00 PM • Riverside Park",
    needs: ["2 Folding Tables", "Setup Crew"]
  };

  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans pb-24">
      {/* Draft Banner */}
      <div className="bg-stone-text text-white text-center py-2 px-4 text-sm font-medium">
        👀 This is a preview! Only you can see this. <Link href="/publish" className="underline ml-2 hover:text-stone-sage-light">Create an account to Publish & Share</Link>
      </div>

      <Header />

      {/* The Stone (Event Info) */}
      <section className="bg-stone-paper/30 border-b border-stone-sage-light/20 relative">
        {isReady && (
          <div className="absolute top-0 left-0 w-full bg-stone-sage text-white text-center py-2 font-bold tracking-widest uppercase text-sm shadow-sm z-10">
            🍲 The Soup is Ready! See you at the feast.
          </div>
        )}
        <div className={`max-w-3xl mx-auto px-6 pb-12 sm:pb-16 text-center ${isReady ? 'pt-20' : 'pt-12 sm:pt-16'}`}>
          <div className="inline-block px-3 py-1 bg-stone-sage/10 text-stone-sage font-medium text-xs uppercase tracking-widest rounded-full mb-6">
            Community Gathering
          </div>
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
          
          <div className="mt-8 text-sm text-stone-text/60">
            Initiated by <span className="font-semibold text-stone-text">You</span>
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
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="I can bring..."
                  className="flex-1 p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50"
                />
                <button 
                  onClick={handleAddIngredient}
                  className="bg-stone-sage hover:bg-[#7a8c79] text-white px-6 py-4 rounded-xl font-semibold shadow-sm transition-colors whitespace-nowrap"
                >
                  Add to Pot
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
               {!isReady && eventData.needs.length > 0 && <span className="bg-stone-terracotta/10 text-stone-terracotta text-xs font-bold px-2 py-1 rounded-full">{eventData.needs.length} Open</span>}
            </div>

            <div className="space-y-4">
               {eventData.needs.length === 0 && (
                 <p className="text-stone-text/50 italic text-sm">No initial needs were requested.</p>
               )}
               {eventData.needs.map((need, index) => (
                 <IngredientCard 
                   key={index}
                   type="need"
                   status="open"
                   title={need}
                   isReady={isReady}
                 />
               ))}
               
               {/* Hardcoded Claimed Item to show state */}
               <IngredientCard 
                 type="need"
                 status="filled"
                 title="Good Vibes"
                 claimedBy="Everyone"
                 isReady={isReady}
               />
            </div>
          </div>

          {/* Column 2: Surprise Offerings */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-stone-sage-light/30 pb-3">
               <h3 className="text-xl font-bold">Surprise Ingredients</h3>
            </div>

            <div className="space-y-4">
               {surprises.map((surprise, index) => (
                 <IngredientCard 
                   key={index}
                   type="surprise"
                   description={surprise.offering}
                   claimedBy={{ name: surprise.name }}
                 />
               ))}
               
               {/* Hidden if Ready */}
               {!isReady && (
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
