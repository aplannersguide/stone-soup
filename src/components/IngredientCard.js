export default function IngredientCard({ 
  type = 'need', // 'need' or 'surprise'
  status = 'open', // 'open', 'filled'
  title, 
  description, 
  claimedBy = null, // e.g. "Sam T." or { initials: "ER", name: "Elena R." }
  isReady = false,
  onClaim = () => {}
}) {
  
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
               <span className="font-bold">{claimedBy?.name || 'Someone'}</span> is bringing:
             </div>
             <p className="text-base font-medium text-stone-terracotta-dark mt-1">
               "{description || title}"
             </p>
           </div>
        </div>
      </div>
    );
  }

  if (type === 'need') {
    // If it's a need and it is OPEN
    if (status === 'open') {
      return (
        <div className={`bg-white p-5 rounded-xl shadow-sm border ${isReady ? 'border-red-200 bg-red-50/30' : 'border-stone-sage-light/20'} flex flex-col gap-3 group hover:border-stone-terracotta/30 transition-colors`}>
           <div>
             <h4 className="font-bold text-lg leading-tight">{title}</h4>
             {description && (
               <p className={`text-sm mt-1 ${isReady ? 'text-red-800/70' : 'text-stone-text/70'}`}>
                 {description}
               </p>
             )}
             {isReady && <p className="text-sm text-red-800/70 font-semibold mt-1">We still need this!</p>}
           </div>
           
           {!isReady && (
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
             <div className="mt-2 text-sm text-stone-text/70">
               Bringing: <strong>{typeof claimedBy === 'string' ? claimedBy : claimedBy.name}</strong>
             </div>
           )}
        </div>
      );
    }
  }

  return null;
}
