'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';

// Icon components for better UI
const MailIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockClosedIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CalendarIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);


export default function AuthPage() {
  // State to manage which view is active: 'signIn', 'signUp', 'forgotPassword', 'updatePassword'
  const [view, setView] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    // This effect runs when the component mounts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setView('updatePassword');
      } else if (session) {
        setView('loggedIn');
      } else {
        setView('signIn');
      }
    });

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            setSession(session);
            setView('loggedIn');
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle form submissions
  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (view === 'signUp') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              username: username,
              date_of_birth: dob,
            },
            // This will send a confirmation link to the user's email
            emailRedirectTo: `${window.location.origin}`,
          },
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');

      } else if (view === 'signIn') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // The onAuthStateChange listener will handle view change to 'loggedIn'
      } else if (view === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`, // Redirect back to the main page to handle the recovery event
        });
        if (error) throw error;
        setMessage('Check your email for the password reset link!');
      } else if (view === 'updatePassword') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Password updated successfully! You can now sign in.');
        setView('signIn');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle social logins
  const handleSocialLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
            redirectTo: `${window.location.origin}`,
        }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setView('signIn'); // Reset view to sign-in
    setEmail('');
    setPassword('');
    // Clear all other fields
    setFirstName('');
    setLastName('');
    setUsername('');
    setDob('');
    setLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const renderForm = () => {
    if (view === 'loggedIn') {
        return (
            <motion.div
                key="loggedIn"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={formVariants}
                className="text-center"
            >
                <h2 className="text-2xl font-bold text-white mb-4">Welcome back!</h2>
                <p className="text-gray-300 mb-6">You are successfully logged in.</p>
                <p className="text-gray-400 text-sm break-all mb-6">Email: {session.user.email}</p>
                <button
                    onClick={handleSignOut}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Signing out...' : 'Sign Out'}
                </button>
            </motion.div>
        );
    }

    return (
      <motion.form
        key={view}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={formVariants}
        onSubmit={handleAuthAction}
        className="space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-white">
          {view === 'signIn' && 'Sign In'}
          {view === 'signUp' && 'Create an Account'}
          {view === 'forgotPassword' && 'Reset Password'}
          {view === 'updatePassword' && 'Update Password'}
        </h2>

        {view === 'signUp' && (
          <>
            <div className="flex space-x-4">
                <div className="relative w-1/2">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" />
                </div>
                <div className="relative w-1/2">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" />
                </div>
            </div>
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" />
            </div>
             <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} required className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" />
            </div>
          </>
        )}

        {(view === 'signIn' || view === 'signUp' || view === 'forgotPassword') && (
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" />
          </div>
        )}

        {(view === 'signIn' || view === 'signUp' || view === 'updatePassword') && (
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 
           view === 'signIn' ? 'Sign In' :
           view === 'signUp' ? 'Sign Up' :
           view === 'forgotPassword' ? 'Send Reset Link' :
           'Update Password'
          }
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}
        {message && <p className="text-green-400 text-center">{message}</p>}

        <div className="text-center text-gray-400">
          {view === 'signIn' && (
            <>
              <p>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setView('signUp')} className="font-semibold text-purple-400 hover:underline">
                  Sign Up
                </button>
              </p>
              <p>
                <button type="button" onClick={() => setView('forgotPassword')} className="font-semibold text-purple-400 hover:underline">
                  Forgot Password?
                </button>
              </p>
            </>
          )}
          {view === 'signUp' && (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setView('signIn')} className="font-semibold text-purple-400 hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>

        {(view === 'signIn' || view === 'signUp') && (
          <>
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400">Or continue with</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <div className="flex justify-center space-x-4">
                {/* Social Login Buttons */}
                <button type="button" onClick={() => handleSocialLogin('google')} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition">
                    <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.863 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                </button>
            </div>
          </>
        )}
      </motion.form>
    );
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900 p-4">
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[150px] rounded-full animate-[pulse_8s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-indigo-600/20 blur-[150px] rounded-full animate-[pulse_8s_cubic-bezier(0.4,0,0.6,1)_infinite_4s]"></div>
      </div>

      {/* Holographic Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {renderForm()}
        </AnimatePresence>
      </div>
    </main>
  );
}
