'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function PublishFlow() {
  const [isPublished, setIsPublished] = useState(false);
  const [draft, setDraft] = useState(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [eventId, setEventId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedDraft = localStorage.getItem('stoneSoupDraft');
    if (savedDraft) {
      setDraft(JSON.parse(savedDraft));
    }
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!draft) return;
    
    setIsPublishing(true);

    try {
      // 1. Authenticate / Create Account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // Ensure we have a user
      const user = authData.user;
      if (!user) throw new Error("Could not create user account.");

      // 2. Insert Event (linked to the user)
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([
          { 
            cook_id: user.id,
            stone: draft.stone, 
            description: draft.description,
            pot: draft.pot,
            status: 'Gathering',
            is_public: true
          }
        ])
        .select();

      if (eventError) throw eventError;
      
      const newEventId = eventData[0].id;
      setEventId(newEventId);

      // 2. Insert Initial Needs
      if (draft.needs && draft.needs.length > 0) {
        const needsToInsert = draft.needs.map(need => ({
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

      setIsPublished(true);
      // Clear draft since it is now published
      localStorage.removeItem('stoneSoupDraft');

    } catch (error) {
      console.error("Error publishing event:", error);
      alert("There was an error saving your event. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const eventTitle = draft?.stone || "Spring Swap & Social";

  return (
    <div className="min-h-screen bg-stone-paper font-sans flex flex-col sm:flex-row">
      
      {/* Left Side: The "Why" / Context */}
      <div className="w-full sm:w-5/12 bg-stone-sage text-white p-8 sm:p-16 flex flex-col justify-between">
        <div>
          <Link href="/demo" className="inline-flex items-center gap-2 text-stone-sage-light hover:text-white transition-colors mb-12">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Draft
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Soups smelling good!</h1>
          <p className="text-stone-sage-light text-lg leading-relaxed mb-8">
            Your soup, <strong>{eventTitle}</strong>, is looking great. 
          </p>
          <div className="bg-black/10 p-6 rounded-2xl border border-white/10">
            <p className="font-medium text-sm text-stone-sage-light uppercase tracking-widest mb-2">Why do I need an account?</p>
            <p className="text-sm/relaxed">
              We need a way to link this event to you so you can manage it later. An account allows you to access your Cook's Dashboard, where you can accept or decline surprise ingredients and declare when the soup is ready.
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3 opacity-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h16"/>
            <path d="M5 10v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-6"/>
            <path d="M2 10h2"/>
            <path d="M20 10h2"/>
            <path d="M8 5v1"/>
            <path d="M12 4v2"/>
            <path d="M16 5v1"/>
          </svg>
          <span className="font-bold tracking-tight">Stone Soup</span>
        </div>
      </div>

      {/* Right Side: The Form */}
      <div className="w-full sm:w-7/12 flex items-center justify-center p-8 sm:p-16 bg-stone-cream relative">
         {!isPublished ? (
           <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-3xl font-bold text-stone-text mb-2">Create your free account</h2>
             <p className="text-stone-text/60 mb-8">Publish your event and get your shareable link.</p>
             
             {/* Simple Auth Options */}
             <div className="space-y-4 mb-8">
                <button 
                  onClick={handlePublish} 
                  disabled={isPublishing}
                  className="w-full bg-white border border-stone-sage-light/50 text-stone-text font-bold py-3.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:border-stone-sage-light transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {isPublishing ? 'Publishing...' : 'Sign up with Google'}
                </button>
             </div>
             
             <div className="flex items-center gap-4 mb-8">
               <div className="h-px bg-stone-sage-light/50 flex-1"></div>
               <span className="text-sm font-medium text-stone-text/40 uppercase tracking-widest">Or</span>
               <div className="h-px bg-stone-sage-light/50 flex-1"></div>
             </div>

             <form onSubmit={handlePublish} className="space-y-4">
               <div>
                 <label className="block text-sm font-semibold mb-1 text-stone-text/80">Email address</label>
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@example.com" 
                   className="w-full p-3.5 bg-white border border-stone-sage-light/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50" 
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold mb-1 text-stone-text/80">Password</label>
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Create a secure password" 
                   className="w-full p-3.5 bg-white border border-stone-sage-light/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50" 
                 />
               </div>
               <button 
                 type="submit" 
                 disabled={isPublishing}
                 className="w-full bg-stone-text disabled:opacity-50 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors mt-2"
               >
                 {isPublishing ? 'Creating Account & Publishing...' : 'Sign up to Publish'}
               </button>
             </form>
             
             <p className="text-center text-sm text-stone-text/50 mt-8">
               Already have an account? <span className="text-stone-text font-bold cursor-pointer hover:underline">Log in</span>
             </p>
           </div>
         ) : (
           /* Success State */
           <div className="max-w-md w-full text-center animate-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
             </div>
             <h2 className="text-3xl font-bold text-stone-text mb-4">Your soup is published!</h2>
             <p className="text-stone-text/70 mb-8 text-lg">
               You are officially the Cook for <strong>{eventTitle}</strong>. 
             </p>
             
             <div className="bg-white p-6 rounded-2xl border border-stone-sage-light/30 shadow-sm mb-8 text-left">
                <p className="text-sm font-bold text-stone-sage uppercase tracking-wider mb-2">Your Shareable Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-stone-paper text-stone-text/80 p-3 rounded-lg text-sm select-all">
                    {eventId ? `localhost:3000/soup/${eventId}` : 'stonesoup.com/e/x9f2bL'}
                  </code>
                  <button className="bg-stone-sage text-white p-3 rounded-lg hover:bg-stone-sage-dark transition-colors" title="Copy to clipboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
             </div>

             <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1 bg-stone-terracotta hover:bg-stone-terracotta-dark text-white font-bold py-4 rounded-xl shadow-sm transition-all text-center">
                  Go to Dashboard
                </Link>
             </div>
           </div>
         )}
      </div>

    </div>
  );
}
