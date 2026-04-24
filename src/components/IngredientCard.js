import { useState } from 'react';

export default function IngredientCard({ 
  type = 'need', // 'need' or 'surprise'
  status = 'open', // 'open', 'filled', 'claimed'
  title, 
  description, 
  claimedBy = null, 
  isReady = false,
  isHost = false,
  guestName = null,
  onClaim = () => {},
  onUnclaim = () => {},
  onUpdate = () => {},
  onDelete = () => {}
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  
  const handleSave = () => {
    onUpdate(editTitle);
    setIsEditing(false);
  };
  if (type === 'surprise') {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-sage-light/20">
        <div className="flex gap-3">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              claimedBy?.name === 'You (Guest)' ? 'bg-stone-terracotta/20 text-stone-terracotta' : 'bg-stone-sage/20 text-stone-sage-dark'
           }`}>
              <span className="font-bold text-sm">
                {claimedBy?.initials || claimedBy?.name?.substring(0, 2).toUpperCase() || '??'}
              </span>
           </div>
           <div>
             <div className="font-medium text-sm">
               <span className="font-bold">{claimedBy?.name === guestName ? 'You' : (claimedBy?.name || 'Someone')}</span> is bringing:
             </div>
             <p className="text-base font-medium text-stone-terracotta-dark mt-1">
               "{description || title}"
             </p>
             {!isReady && !isHost && claimedBy?.name === guestName && (
               <button onClick={onUnclaim} className="text-xs text-red-400 hover:text-red-600 underline mt-2 font-medium">
                 Undo (Remove this)
               </button>
             )}
           </div>
        </div>
      </div>
    );
  }

  if (type === 'need') {
    if (status === 'open') {
      return (
        <div className={`bg-white p-5 rounded-xl shadow-sm border ${isReady ? 'border-red-200 bg-red-50/30' : 'border-stone-sage-light/20'} flex flex-col gap-3 group hover:border-stone-terracotta/30 transition-colors relative`}>
           {isHost && !isEditing && (
             <div className="absolute top-3 right-3 flex gap-2">
               <button onClick={() => setIsEditing(true)} className="text-stone-text/40 hover:text-stone-sage" title="Edit">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
               </button>
               <button onClick={onDelete} className="text-stone-text/40 hover:text-red-500" title="Delete">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
               </button>
             </div>
           )}

           {isEditing ? (
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={editTitle}
                 onChange={(e) => setEditTitle(e.target.value)}
                 className="flex-1 p-2 bg-stone-cream/50 border border-stone-sage-light rounded focus:outline-none"
                 autoFocus
               />
               <button onClick={handleSave} className="bg-stone-sage text-white px-3 py-1 rounded text-sm font-semibold">Save</button>
             </div>
           ) : (
             <div>
               <h4 className="font-bold text-lg leading-tight pr-12">{title}</h4>
               {description && (
                 <p className={`text-sm mt-1 ${isReady ? 'text-red-800/70' : 'text-stone-text/70'}`}>
                   {description}
                 </p>
               )}
               {isReady && <p className="text-sm text-red-800/70 font-semibold mt-1">We still need this!</p>}
             </div>
           )}
           
           {!isReady && !isHost && (
             <button 
               onClick={onClaim}
               className="text-sm self-start font-semibold bg-stone-cream text-stone-terracotta border border-stone-terracotta/20 px-4 py-2 rounded-lg hover:bg-stone-terracotta hover:text-white transition-colors shrink-0"
             >
               I'll bring this
             </button>
           )}
        </div>
      );
    }

    // If it's a need and it is FILLED
    if (status === 'filled') {
      return (
        <div className={`${isReady ? 'bg-white shadow-sm' : 'bg-stone-paper/50 opacity-75'} p-5 rounded-xl border border-stone-sage-light/20`}>
           <div className="flex items-center justify-between">
             <div>
               <h4 className={`font-bold text-lg mb-1 ${!isReady && 'line-through text-stone-text/60'}`}>{title}</h4>
             </div>
             <span className="text-sm font-bold text-stone-sage flex items-center gap-1">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
               {isReady ? 'Ready' : 'Filled'}
             </span>
           </div>
           {claimedBy && (
             <div className="mt-2 text-sm text-stone-text/70 flex justify-between items-center">
               <span>
                 Bringing: <strong>{typeof claimedBy === 'string' ? (claimedBy === guestName ? 'You' : claimedBy) : (claimedBy.name === guestName ? 'You' : claimedBy.name)}</strong>
               </span>
               {!isReady && !isHost && ((typeof claimedBy === 'string' ? claimedBy : claimedBy.name) === guestName) && (
                 <button onClick={onUnclaim} className="text-xs text-red-400 hover:text-red-600 underline font-medium">
                   Undo
                 </button>
               )}
             </div>
           )}
        </div>
      );
    }
  }

  return null;
}
