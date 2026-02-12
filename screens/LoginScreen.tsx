
import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const LoginScreen: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!username || !city) throw new Error('Please fill in all profile details');
        
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          username,
          email,
          city,
          postCount: 0,
          createdAt: Date.now()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      const msg = e.code?.includes('auth/') 
        ? e.code.split('/')[1].replace(/-/g, ' ') 
        : e.message;
      setError(msg.charAt(0).toUpperCase() + msg.slice(1));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // If first time Google login, create the profile
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          username: user.displayName || 'Anonymous',
          email: user.email,
          city: 'Unknown', // User can update this later in profile
          postCount: 0,
          createdAt: Date.now()
        });
      }
    } catch (e: any) {
      setError('Could not sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#5AD7E0]/30">
      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="inline-flex items-center justify-center size-16 bg-[#5AD7E0] rounded-3xl mb-6 shadow-xl shadow-[#5AD7E0]/20 animate-bounce-slow">
            <span className="material-symbols-outlined text-white text-3xl font-black">location_on</span>
          </div>
          <h1 className="text-3xl font-[800] tracking-tight text-[#000000] mb-2">
            {isRegister ? 'Join Loco' : 'Welcome Home'}
          </h1>
          <p className="text-[#000000]/50 text-sm font-medium leading-relaxed">
            {isRegister 
              ? 'Create an account to start connecting with your local neighbors today.' 
              : 'Sign in to see what is happening in your neighborhood right now.'}
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-10">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">person</span>
                  <input 
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-black font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#5AD7E0] transition-all"
                    placeholder="Full Name"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">map</span>
                  <input 
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-black font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#5AD7E0] transition-all"
                    placeholder="Your Neighborhood / City"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">alternate_email</span>
              <input 
                required
                type="email"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-black font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#5AD7E0] transition-all"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">lock</span>
              <input 
                required
                type="password"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-black font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#5AD7E0] transition-all"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-[12px] font-bold px-1 animate-pulse">
                {error}
              </p>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#5AD7E0] text-[#000000] py-4 rounded-2xl font-[800] text-base shadow-xl shadow-[#5AD7E0]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">or continue with</span>
            </div>
          </div>

          {/* Social Auth */}
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-100 text-[#000000] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors active:scale-[0.98]"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          {/* Toggle Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-[#000000] font-bold text-sm hover:text-[#5AD7E0] transition-colors"
            >
              {isRegister ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
