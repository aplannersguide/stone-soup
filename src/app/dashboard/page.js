'use client';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans pb-24">
      {/* Header / Navigation */}
      <header className="border-b border-stone-sage-light/30 bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
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
            <div className="h-4 w-px bg-stone-sage-light/50 hidden sm:block"></div>
            <span className="font-medium text-stone-sage hidden sm:block">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/" className="text-sm font-semibold bg-stone-terracotta/10 text-stone-terracotta hover:bg-stone-terracotta hover:text-white px-4 py-2 rounded-lg transition-colors">
               + New Soup
             </Link>
             <div className="h-9 w-9 rounded-full bg-stone-sage text-white flex items-center justify-center font-bold shadow-sm">
              SJ
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
           <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Welcome back, Sarah.</h1>
           <p className="text-stone-text/70 text-lg">Here's what's cooking in your pots.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Column: Hosting */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold border-b border-stone-sage-light/30 pb-3 flex items-center justify-between">
              My Soups <span className="text-sm font-normal text-stone-text/50">Events you are hosting</span>
            </h2>

            {/* Active Event Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-sage-light/40 overflow-hidden">
              <div className="p-6 border-b border-stone-sage-light/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="inline-block px-2 py-1 bg-stone-terracotta/10 text-stone-terracotta font-bold text-[10px] uppercase tracking-widest rounded mb-2">
                      Active
                    </div>
                    <Link href="/demo" className="hover:underline decoration-stone-terracotta/30 underline-offset-4">
                      <h3 className="text-2xl font-bold">Spring Swap & Social</h3>
                    </Link>
                    <p className="text-sm text-stone-text/60 mt-1">Sat, April 20 • Riverside Park</p>
                  </div>
                  <Link href="/demo" className="text-sm font-medium text-stone-sage hover:text-stone-sage-dark bg-stone-paper px-3 py-1.5 rounded-lg border border-stone-sage-light/30">
                    View Event Page
                  </Link>
                </div>

                {/* Progress Mini-Bar */}
                <div className="mt-6">
                   <div className="flex justify-between text-sm font-medium mb-2">
                     <span className="text-stone-text/70">Ingredients Gathered</span>
                     <span className="text-stone-terracotta-dark">5 / 8 Needs Filled</span>
                   </div>
                   <div className="w-full h-2.5 bg-stone-paper rounded-full overflow-hidden">
                      <div className="h-full bg-stone-terracotta w-[62%] rounded-full"></div>
                   </div>
                </div>
              </div>

              {/* Action Area: Pending Ingredients */}
              <div className="bg-stone-cream/30 p-6">
                 <h4 className="font-bold text-sm text-stone-sage uppercase tracking-wider mb-4 flex items-center gap-2">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-stone-terracotta"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                   Requires Your Attention
                 </h4>
                 
                 {/* Pending Item */}
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-terracotta/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3 items-center">
                       <div className="w-8 h-8 rounded-full bg-[#B5C2B4] flex items-center justify-center shrink-0">
                          <span className="text-stone-text font-bold text-xs">ML</span>
                       </div>
                       <div>
                         <p className="text-sm">
                           <span className="font-bold">Mike L.</span> offered a surprise:
                         </p>
                         <p className="font-medium text-stone-terracotta-dark">"A stack of moving boxes for leftovers"</p>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                       <button className="text-sm font-semibold bg-stone-sage text-white px-4 py-2 rounded-lg hover:bg-[#7a8c79] transition-colors">
                         Accept
                       </button>
                       <button className="text-sm font-semibold bg-stone-paper text-stone-text/60 px-4 py-2 rounded-lg hover:bg-stone-sage-light/20 transition-colors">
                         Decline
                       </button>
                    </div>
                 </div>
              </div>
            </div>

            {/* Draft Event Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-sage-light/40 overflow-hidden opacity-75">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-block px-2 py-1 bg-stone-text/10 text-stone-text font-bold text-[10px] uppercase tracking-widest rounded mb-2">
                      Draft
                    </div>
                    <h3 className="text-xl font-bold">Local Zoning Law Discussion</h3>
                    <p className="text-sm text-stone-text/60 mt-1">Date TBD • Local Library</p>
                  </div>
                  <button className="text-sm font-medium text-stone-text hover:text-stone-terracotta bg-stone-paper px-3 py-1.5 rounded-lg border border-stone-sage-light/30">
                    Resume Editing
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Attending */}
          <div className="space-y-8">
             <h2 className="text-2xl font-bold border-b border-stone-sage-light/30 pb-3 flex items-center justify-between">
              My Contributions
            </h2>

            <div className="space-y-4">
              {/* Contribution Card */}
              <div className="bg-stone-paper/50 p-5 rounded-xl border border-stone-sage-light/30 hover:border-stone-sage-light transition-colors group cursor-pointer">
                 <h3 className="font-bold text-lg mb-1 group-hover:text-stone-terracotta transition-colors">Main St. Block Party</h3>
                 <p className="text-xs text-stone-text/60 mb-3">Sun, May 5 • Initiated by David</p>
                 <div className="bg-white p-3 rounded-lg border border-stone-sage-light/20 text-sm">
                   <span className="text-stone-text/60">You are bringing:</span>
                   <p className="font-bold mt-1">1 Bluetooth Speaker</p>
                 </div>
              </div>

              {/* Contribution Card 2 */}
              <div className="bg-stone-paper/50 p-5 rounded-xl border border-stone-sage-light/30 hover:border-stone-sage-light transition-colors group cursor-pointer">
                 <h3 className="font-bold text-lg mb-1 group-hover:text-stone-terracotta transition-colors">Pizza Night</h3>
                 <p className="text-xs text-stone-text/60 mb-3">Fri, April 26 • Initiated by Elena</p>
                 <div className="bg-white p-3 rounded-lg border border-stone-sage-light/20 text-sm">
                   <span className="text-stone-text/60">You are bringing:</span>
                   <p className="font-bold mt-1">"A six-pack of ginger ale"</p>
                   <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-sage bg-stone-sage/10 px-2 py-1 rounded">Approved by Cook</span>
                 </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
