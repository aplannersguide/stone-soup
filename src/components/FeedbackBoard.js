import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isClean } from '@/lib/contentFilter';

export default function FeedbackBoard({ eventId, isHost, guestName, getGuestName }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    async function fetchFeedback() {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setFeedback(data);
        if (guestName && data.some(f => f.guest_name === guestName)) {
          setHasSubmitted(true);
        }
      }
      setLoading(false);
    }
    fetchFeedback();
  }, [eventId, guestName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating!");
      return;
    }
    
    if (!isClean(comment)) {
      alert("Please keep your comments PG!");
      return;
    }

    const gName = isHost ? 'The Host' : getGuestName();
    if (!gName) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          event_id: eventId,
          guest_name: gName,
          rating,
          comment
        }])
        .select();

      if (error) throw error;
      setFeedback([data[0], ...feedback]);
      setHasSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to save feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse flex justify-center p-8"><span className="text-stone-sage font-bold">Loading memories...</span></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      
      {!hasSubmitted ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-sage-light/30">
          <h3 className="text-2xl font-bold mb-2 text-center">How was the Soup?</h3>
          <p className="text-stone-text/60 text-center mb-6">Leave a memory or a thank you note for the host.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={(hoverRating || rating) >= star ? "text-stone-terracotta drop-shadow-sm" : "text-stone-sage-light/40 grayscale"}>
                    ⭐
                  </span>
                </button>
              ))}
            </div>

            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was your favorite part?"
              maxLength={1000}
              className="w-full p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50 resize-none h-32"
            />

            <button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="w-full bg-stone-sage hover:bg-[#7a8c79] text-white disabled:opacity-50 font-bold py-4 px-8 rounded-xl shadow-sm transition-all text-lg"
            >
              {isSubmitting ? 'Saving...' : 'Add to the Memory Book'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-stone-sage/10 text-stone-sage-dark p-6 rounded-2xl text-center border border-stone-sage/20 font-medium">
          Thank you for leaving your feedback! ✨
        </div>
      )}

      {feedback.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Memory Book
          </h3>
          <div className="space-y-4">
            {feedback.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-sage-light/20 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-lg">{item.guest_name === guestName ? 'You' : item.guest_name}</div>
                  <div className="flex text-sm">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < item.rating ? "text-stone-terracotta" : "text-stone-sage-light/40"}>⭐</span>
                    ))}
                  </div>
                </div>
                {item.comment && <p className="text-stone-text/80 leading-relaxed">"{item.comment}"</p>}
                <div className="absolute -left-2 -top-2 text-2xl opacity-20">💬</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
