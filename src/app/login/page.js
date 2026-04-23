'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // Navigate to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-cream text-stone-text font-sans flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-sage-light/30 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-stone-text/60 text-center mb-8">Sign in to manage your soups.</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-stone-text/80">Email address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-stone-text/80">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password" 
                className="w-full p-4 bg-stone-cream/50 border border-stone-sage-light rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-terracotta/50" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-terracotta disabled:opacity-50 hover:bg-stone-terracotta-dark text-white font-bold py-4 rounded-xl transition-colors mt-4 shadow-sm hover:shadow"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-text/50 mt-8">
            Don't have an account? <Link href="/" className="text-stone-terracotta font-bold hover:underline">Start a soup to create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
