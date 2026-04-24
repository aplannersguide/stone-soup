'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { geocodeLocation } from '@/lib/geocode';
import IngredientCard from '@/components/IngredientCard';
import FeedbackBoard from '@/components/FeedbackBoard';
import Header from '@/components/Header';
import { isClean } from '@/lib/contentFilter';

export default function DynamicEventPage() {
  const params = useParams();
  const eventId = params.id;

  const [eventData, setEventData] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestName, setGuestName] = useState(null);

  const [newSurprise, setNewSurprise] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editData, setEditData] = useState({
    stone: '',
    description: '',
    location: '',
    event_date: '',
    event_time: ''
  });

  useEffect(() => {
    // Client-side local storage init
    const savedName = localStorage.getItem('stoneSoupGuestName');
    if (savedName) setGuestName(savedName);

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
        setEditData({
          stone: event.stone || '',
          description: event.description || '',
          location: event.location || '',
          event_date: event.event_date || '',
          event_time: event.event_time || ''
        });

        // Fetch Ingredients
        const { data: ings, error: ingsError } = await supabase
          .from('ingredients')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true });

        if (ingsError) throw ingsError;
        setIngredients(ings || []);

        // Fetch User to check if Host
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.id === event.cook_id) {
          setIsHost(true);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load this event. It may have been deleted or the link is invalid.");
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndIngredients();
  }, [eventId]);

  const handleAutoSaveEventField = async (field, value) => {
    if (!isClean(value)) {
      alert("Please keep your text PG!");
      setEditData(prev => ({ ...prev, [field]: eventData[field] }));
      return;
    }

    try {
      let extraUpdates = {};
      if (field === 'location') {
        const coords = await geocodeLocation(value);
        extraUpdates.lat = coords.lat;
        extraUpdates.lng = coords.lng;
      }

      const { data, error } = await supabase
        .from('events')
        .update({ [field]: value, ...extraUpdates })
        .eq('id', eventId)
        .select();

      if (error) throw error;
      setEventData(data[0]);
    } catch (err) {
      console.error(`Error updating ${field}:`, err.message || err);
      // Revert editData to original if failed
      setEditData(prev => ({ ...prev, [field]: eventData[field] }));
      alert(`Failed to save ${field}: ${err.message || 'Unknown error'}`);
    }
  };

  const getGuestName = () => {
    if (guestName) return guestName;
    const name = window.prompt("What's your name, chef?");
    if (name && name.trim()) {
      localStorage.setItem('stoneSoupGuestName', name.trim());
      setGuestName(name.trim());
      return name.trim();
    }
    return null;
  };

  const handleAddSurprise = async () => {
    if (!newSurprise.trim() || !eventData) return;
    if (!isClean(newSurprise)) {
      alert("Please keep your ingredients PG!");
      return;
    }
    const gName = isHost ? 'The Host' : getGuestName();
    if (!gName) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([{
          event_id: eventData.id,
          title: newSurprise,
          type: 'surprise',
          status: 'pending',
          claimed_by_name: gName
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
    const gName = getGuestName();
    if (!gName) return;

    try {
      const { data, error } = await supabase
        .from('ingredients')
        .update({
          status: 'filled',
          claimed_by_name: gName
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

  const handleUnclaimNeed = async (ingredientId) => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .update({
          status: 'open',
          claimed_by_name: null
        })
        .eq('id', ingredientId)
        .select();

      if (error) throw error;
      setIngredients(ingredients.map(ing =>
        ing.id === ingredientId ? data[0] : ing
      ));
    } catch (err) {
      console.error("Error unclaiming need:", err);
      alert("Failed to unclaim ingredient.");
    }
  };

  const handleUpdateIngredientStatus = async (ingredientId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .update({ status: newStatus })
        .eq('id', ingredientId)
        .select();

      if (error) throw error;

      setIngredients(ingredients.map(ing =>
        ing.id === ingredientId ? data[0] : ing
      ));
    } catch (err) {
      console.error("Error updating ingredient:", err);
      alert("Failed to update ingredient.");
    }
  };

  const handleAddNeed = async () => {
    if (!newSurprise.trim() || !eventData) return;
    if (!isClean(newSurprise)) {
      alert("Please keep your ingredients PG!");
      return;
    }
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([{
          event_id: eventData.id,
          title: newSurprise,
          type: 'need',
          status: 'open'
        }])
        .select();

      if (error) throw error;
      setIngredients([...ingredients, data[0]]);
      setNewSurprise('');
    } catch (err) {
      console.error("Error adding need:", err);
      alert("Failed to add need.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNeed = async (ingredientId) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', ingredientId);

      if (error) throw error;
      setIngredients(ingredients.filter(ing => ing.id !== ingredientId));
    } catch (err) {
      console.error("Error deleting need:", err);
      alert("Failed to delete ingredient.");
    }
  };

  const handleUpdateNeedTitle = async (ingredientId, newTitle) => {
    if (!isClean(newTitle)) {
      alert("Please keep your ingredients PG!");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .update({ title: newTitle })
        .eq('id', ingredientId)
        .select();

      if (error) throw error;
      setIngredients(ingredients.map(ing =>
        ing.id === ingredientId ? data[0] : ing
      ));
    } catch (err) {
      console.error("Error updating need title:", err);
      alert("Failed to update ingredient title.");
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Event link copied to clipboard!");
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
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

  const isReady = eventData.status === 'Ready' || eventData.status === 'Completed';
  const isCompleted = eventData.status === 'Completed';
  const needs = ingredients.filter(i => i.type === 'need');
  const openNeedsCount = needs.filter(i => i.status === 'open').length;
  const surprises = ingredients.filter(i => i.type === 'surprise' && i.status !== 'rejected');

  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans pb-24">
      <Header />

      {/* The Stone (Event Info) */}
      <section className="bg-stone-paper/30 border-b border-stone-sage-light/20 relative">
        {isReady && !isCompleted && (
          <div className="absolute top-0 left-0 w-full bg-stone-sage text-white text-center py-2 font-bold tracking-widest uppercase text-sm shadow-sm z-10">
            🍲 The Soup is Ready! See you at the feast.
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-0 left-0 w-full bg-stone-terracotta text-white text-center py-2 font-bold tracking-widest uppercase text-sm shadow-sm z-10">
            ✨ This soup has been enjoyed! Thank you to everyone who contributed.
          </div>
        )}
        <div className={`max-w-3xl mx-auto px-6 pb-12 sm:pb-16 text-center ${isReady ? 'pt-20' : 'pt-12 sm:pt-16'}`}>
          {isHost && !isReady ? (
            <div className="group relative">
              <div className="flex justify-center mb-4">
                <span className="bg-stone-terracotta text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                  Host Mode
                </span>
              </div>
              <input
                type="text"
                value={editData.stone}
                onChange={e => setEditData({ ...editData, stone: e.target.value })}
                onBlur={e => handleAutoSaveEventField('stone', e.target.value)}
                maxLength={100}
                className="w-full text-center text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-stone-terracotta-dark bg-transparent border-b-2 border-transparent hover:border-stone-sage-light/50 focus:outline-none focus:border-stone-terracotta transition-colors"
                placeholder="Event Title"
              />
              <textarea
                value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                onBlur={e => handleAutoSaveEventField('description', e.target.value)}
                maxLength={500}
                className="w-full text-center text-lg text-stone-text/80 max-w-2xl mx-auto mb-8 bg-transparent border-b-2 border-transparent hover:border-stone-sage-light/50 focus:outline-none focus:border-stone-terracotta transition-colors resize-none"
                placeholder="Add a description..."
                rows="2"
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-stone-text/70 font-medium">
                <div className="flex items-center gap-2 bg-white px-6 py-2 rounded-xl shadow-sm border border-stone-sage-light/20 focus-within:border-stone-terracotta transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={e => setEditData({ ...editData, location: e.target.value })}
                    onBlur={e => handleAutoSaveEventField('location', e.target.value)}
                    maxLength={150}
                    className="bg-transparent focus:outline-none text-center w-40 sm:w-auto font-medium"
                    placeholder="Location"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white px-6 py-2 rounded-xl shadow-sm border border-stone-sage-light/20 focus-within:border-stone-terracotta transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <input
                    type="date"
                    value={editData.event_date}
                    onChange={e => setEditData({ ...editData, event_date: e.target.value })}
                    onBlur={e => handleAutoSaveEventField('event_date', e.target.value)}
                    className="bg-transparent focus:outline-none text-sm font-medium"
                  />
                  <span className="opacity-50">•</span>
                  <input
                    type="time"
                    value={editData.event_time}
                    onChange={e => setEditData({ ...editData, event_time: e.target.value })}
                    onBlur={e => handleAutoSaveEventField('event_time', e.target.value)}
                    className="bg-transparent focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-stone-text/40 mt-6 uppercase tracking-wider font-bold">✨ Click any text above to edit. Auto-saves when you click away.</p>
            </div>
          ) : (
            <div className="relative">
              {isHost && (
                <div className="flex justify-center mb-4">
                  <span className="bg-stone-terracotta text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                    Host Mode
                  </span>
                </div>
              )}
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-stone-terracotta-dark">
                {eventData.stone}
              </h1>
              {eventData.description && (
                <p className="text-lg text-stone-text/80 max-w-2xl mx-auto mb-8">
                  {eventData.description}
                </p>
              )}

              {/* The Pot (Location/Time) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-stone-text/70 font-medium">
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-stone-sage-light/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{eventData.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-stone-sage-light/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{eventData.event_date} • {eventData.event_time}</span>
                </div>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-stone-terracotta text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-stone-terracotta-dark transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  <span>Share Soup</span>
                </button>
              </div>
            </div>
          )}

          {/* Host Status Actions */}
          {isHost && (
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => handleAutoSaveEventField('status', 'Ready')}
                className={`px-6 py-2 text-sm rounded-full font-bold shadow-sm transition-colors ${eventData.status === 'Ready' ? 'bg-stone-sage text-white' : 'bg-white text-stone-sage border border-stone-sage hover:bg-stone-sage/10'}`}
              >
                🍲 Ready
              </button>
              <button
                onClick={() => handleAutoSaveEventField('status', 'Completed')}
                className={`px-6 py-2 text-sm rounded-full font-bold shadow-sm transition-colors ${eventData.status === 'Completed' ? 'bg-stone-terracotta text-white' : 'bg-white text-stone-terracotta border border-stone-terracotta hover:bg-stone-terracotta/10'}`}
              >
                ✨ Completed
              </button>
              <button
                onClick={() => handleAutoSaveEventField('status', 'Gathering')}
                className={`px-6 py-2 text-sm rounded-full font-bold shadow-sm transition-colors ${eventData.status === 'Gathering' ? 'bg-stone-text/80 text-white' : 'bg-white text-stone-text/80 border border-stone-text/80 hover:bg-stone-text/10'}`}
              >
                Gathering
              </button>
            </div>
          )}
        </div>
      </section>

      {/* The Shared Pot (Ingredient Board) or Feedback Board */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {isCompleted ? (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">The Feast is Over</h2>
              <p className="text-stone-text/70">What a wonderful gathering! Leave your thoughts below.</p>
            </div>
            <FeedbackBoard
              eventId={eventId}
              isHost={isHost}
              guestName={guestName}
              getGuestName={getGuestName}
            />

            <div className="mt-20 pt-12 border-t border-stone-sage-light/20 opacity-50">
              <h3 className="text-center font-bold text-xl mb-8">What we brought</h3>
              {/* Read-only rendering of ingredients */}
              <div className="grid sm:grid-cols-2 gap-4">
                {ingredients.map(ing => (
                  <div key={ing.id} className="bg-white p-4 rounded shadow-sm border border-stone-sage-light/30">
                    <span className="font-bold">{ing.title}</span> - brought by {ing.claimed_by_name || 'Someone'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
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
                    onKeyDown={(e) => e.key === 'Enter' && (isHost ? handleAddNeed() : handleAddSurprise())}
                    placeholder={isHost ? "Add a new need to the pot..." : "I can bring..."}
                    maxLength={60}
                    className="flex-1 p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={isHost ? handleAddNeed : handleAddSurprise}
                    disabled={isSubmitting || !newSurprise.trim()}
                    className="bg-stone-sage hover:bg-[#7a8c79] disabled:opacity-50 text-white px-6 py-4 rounded-xl font-semibold shadow-sm transition-colors whitespace-nowrap"
                  >
                    {isSubmitting ? 'Adding...' : (isHost ? 'Add Need' : 'Add to Pot')}
                  </button>
                </div>
                <p className="text-xs text-stone-text/50 mt-3 text-center">
                  {isHost
                    ? "You can add new ingredients that you need for the event."
                    : "*Remember, things like 'helping set up' or 'good vibes' are perfect ingredients!"}
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
                      isHost={isHost}
                      guestName={guestName}
                      onClaim={() => handleClaimNeed(need.id)}
                      onUnclaim={() => handleUnclaimNeed(need.id)}
                      onDelete={() => handleDeleteNeed(need.id)}
                      onUpdate={(newTitle) => handleUpdateNeedTitle(need.id, newTitle)}
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
                    <div key={surprise.id} className="relative">
                      <IngredientCard
                        type="surprise"
                        title={surprise.title}
                        claimedBy={{ name: surprise.claimed_by_name }}
                        status={surprise.status}
                        isReady={isReady}
                        isHost={isHost}
                        guestName={guestName}
                        onUnclaim={() => handleDeleteNeed(surprise.id)}
                      />
                      {/* Host Controls for Surprises */}
                      {isHost && surprise.status === 'pending' && (
                        <div className="absolute -bottom-3 right-4 flex gap-2">
                          <button
                            onClick={() => handleUpdateIngredientStatus(surprise.id, 'approved')}
                            className="bg-stone-sage text-white text-xs font-bold px-3 py-1 rounded shadow-sm hover:bg-[#7a8c79]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateIngredientStatus(surprise.id, 'rejected')}
                            className="bg-stone-paper text-stone-text/70 border border-stone-sage-light text-xs font-bold px-3 py-1 rounded shadow-sm hover:bg-white"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
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
          </div>
        )}
      </main>
    </div>
  );
}
