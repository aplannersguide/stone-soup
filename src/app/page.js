'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function Home() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    stone: '',
    description: '',
    location: '',
    event_date: '',
    event_time: '',
    needs: ['', '']
  });

  const handleNeedChange = (index, value) => {
    const newNeeds = [...formData.needs];
    newNeeds[index] = value;
    setFormData({ ...formData, needs: newNeeds });
  };

  const addNeed = () => {
    setFormData({ ...formData, needs: [...formData.needs, ''] });
  };

  const [session, setSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get fresh session to ensure it's not stale
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    // Filter out empty needs
    const cleanNeeds = formData.needs.filter(n => n.trim() !== '');
    const cleanData = {
      stone: formData.stone,
      description: formData.description,
      location: formData.location,
      event_date: formData.event_date,
      event_time: formData.event_time,
      needs: cleanNeeds
    };
    
    if (currentSession?.user) {
      // User is logged in, create event directly
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .insert([
            { 
              cook_id: currentSession.user.id,
              stone: cleanData.stone, 
              pot: `${cleanData.location} | ${cleanData.event_date} ${cleanData.event_time}`, // Legacy column fallback
              description: cleanData.description,
              location: cleanData.location,
              event_date: cleanData.event_date,
              event_time: cleanData.event_time,
              status: 'Gathering',
              is_public: true
            }
          ])
          .select();

        if (eventError) throw eventError;
        
        const newEventId = eventData[0].id;

        if (cleanNeeds.length > 0) {
          const needsToInsert = cleanNeeds.map(need => ({
            event_id: newEventId,
            title: need,
            type: 'need',
            status: 'open'
          }));

          const { error: needsError } = await supabase
            .from('ingredients')
            .insert(needsToInsert);

          if (needsError) throw needsError;
        }

        router.push(`/soup/${newEventId}`);
      } catch (err) {
        console.error("Error creating event:", err.message || err);
        alert(`Failed to create event: ${err.message || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    } else {
      // Not logged in, go to draft flow
      localStorage.setItem('stoneSoupDraft', JSON.stringify(cleanData));
      router.push('/demo');
    }
  };

  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-20 grid lg:grid-cols-12 gap-16">
        
        {/* Left Column: Concept & Guidelines */}
        <div className="lg:col-span-5 space-y-12">
           <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-terracotta-dark">
                Shift from scarcity to abundance.
              </h1>
              <p className="text-lg text-stone-text/80 leading-relaxed">
                In the fable of Stone Soup, a hungry stranger convinces a village to share their small, individual food hoards to create a massive feast that feeds everyone. 
              </p>
              <p className="text-lg text-stone-text/80 leading-relaxed">
                This platform helps you host events the same way. You bring the "Stone" (an idea) and the "Pot" (a venue). Your community brings the ingredients—food, skills, gear, or just a helping hand. 
              </p>
           </div>

           <div className="bg-stone-paper/50 p-8 rounded-2xl border border-stone-sage-light/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-sage"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                 How it works
              </h2>
              <ul className="space-y-4 text-sm text-stone-text/80">
                 <li className="flex gap-3">
                   <span className="text-stone-terracotta font-bold">1.</span>
                   <span><strong>Start the Pot.</strong> You provide the central idea (The Stone) and the venue (The Pot). Make sure it's something you'd enjoy even if it's just a few people.</span>
                 </li>
                 <li className="flex gap-3">
                   <span className="text-stone-terracotta font-bold">2.</span>
                   <span><strong>Ask for Ingredients.</strong> List the few key things you need to make the event great—tables, food, a speaker, or helping hands.</span>
                 </li>
                 <li className="flex gap-3">
                   <span className="text-stone-terracotta font-bold">3.</span>
                   <span><strong>The Community Contributes.</strong> Attendees claim your needs or offer their own "Surprise Ingredients." When the pot is full, you declare the soup ready!</span>
                 </li>
              </ul>
           </div>
        </div>

        {/* Right Column: Event Creation Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-sage-light/20 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8">Start a new soup</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* The Stone Section */}
              <section className="relative z-10">
                <label htmlFor="stone" className="block text-2xl font-bold mb-1 text-stone-terracotta-dark">
                  The Stone 🪨
                </label>
                <p className="text-sm text-stone-text/70 mb-4">What's the core idea? (e.g. A cozy book exchange, a neighborhood cleanup)</p>
                <input 
                  type="text" 
                  id="stone"
                  required
                  value={formData.stone}
                  onChange={(e) => setFormData({...formData, stone: e.target.value})}
                  placeholder="Event Title"
                  className="w-full text-base p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50 transition-shadow"
                />
                
                <div className="mt-4">
                  <textarea 
                    id="description" 
                    rows="2" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell people a bit more about why we are gathering..."
                    className="w-full p-4 text-sm bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50 transition-shadow resize-none"
                  ></textarea>
                </div>
              </section>

              {/* The Pot Section */}
              <section>
                 <div className="mb-4">
                   <h3 className="block text-2xl font-bold mb-1 text-stone-terracotta-dark">
                     The Pot 🍲
                   </h3>
                   <p className="text-sm text-stone-text/70">Where and when is this gathering taking place?</p>
                 </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold mb-2 text-stone-text/80">
                        Location
                      </label>
                      <input 
                        type="text" 
                        id="location" 
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. Central Park"
                        className="w-full text-base p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50 transition-shadow"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="event_date" className="block text-sm font-semibold mb-2 text-stone-text/80">
                          Date
                        </label>
                        <input 
                          type="date" 
                          id="event_date" 
                          required
                          value={formData.event_date}
                          onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                          className="w-full text-base p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50 transition-shadow"
                        />
                      </div>
                      <div>
                        <label htmlFor="event_time" className="block text-sm font-semibold mb-2 text-stone-text/80">
                          Time
                        </label>
                        <input 
                          type="time" 
                          id="event_time" 
                          required
                          value={formData.event_time}
                          onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                          className="w-full text-base p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50 transition-shadow"
                        />
                      </div>
                    </div>
                  </div>
              </section>

              {/* Initial Needs Section */}
              <section>
                  <label className="block text-2xl font-bold mb-1 text-stone-terracotta-dark">
                    Initial Ingredients 🥕
                  </label>
                  <p className="text-sm text-stone-text/70 mb-4">List a few things to get the pot started. Attendees can claim these or bring their own surprises.</p>
                  
                  <div className="space-y-3">
                    {formData.needs.map((need, index) => (
                      <input 
                        key={index}
                        type="text" 
                        value={need}
                        onChange={(e) => handleNeedChange(index, e.target.value)}
                        placeholder={index === 0 ? "e.g. 2 folding tables" : "e.g. A bluetooth speaker"} 
                        className="w-full p-3 text-sm bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50" 
                      />
                    ))}
                    
                    <button 
                      type="button" 
                      onClick={addNeed}
                      className="flex items-center gap-2 text-stone-terracotta font-medium text-sm cursor-pointer hover:text-stone-terracotta-dark"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add another need
                    </button>
                  </div>
              </section>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full justify-center bg-stone-terracotta hover:bg-stone-terracotta-dark disabled:opacity-50 text-white text-lg font-bold py-4 px-8 rounded-xl shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? 'Stirring the Pot...' : 'Stir the Pot & Create Event'}
                  {!isSubmitting && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                </button>
              </div>

            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
