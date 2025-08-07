"use client";

import { supabase } from "@/utils/supabase/client"; // Corrected import
import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";

// --- Icon Components ---
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

const PhoneIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const IdIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v1m-6.5 4h.01M12 14h.01M15.5 14h.01M12 17h.01" />
    </svg>
);


// --- Animated Input Field Component ---
const AnimatedInput = ({ icon, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <motion.div className="relative" whileHover={{ scale: 1.02 }}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
                {icon}
            </div>
            <input
                {...props}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-40 text-white rounded-lg border border-transparent focus:border-red-500 focus:ring-0 outline-none transition"
            />
             <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-red-500"
                initial={{ width: 0 }}
                animate={{ width: isFocused ? '100%' : 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            />
        </motion.div>
    );
};

// --- Interactive Aurora Background Component ---
const InteractiveAurora = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 100, stiffness: 10, mass: 5 };
    const mouseXSpring = useSpring(mouseX, springConfig);
    const mouseYSpring = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        
        handleResize();
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, [mouseX, mouseY]);

    const translateX1 = useTransform(mouseXSpring, [0, dimensions.width], ['-50%', '50%']);
    const translateY1 = useTransform(mouseYSpring, [0, dimensions.height], ['-50%', '50%']);
    const translateX2 = useTransform(mouseXSpring, [0, dimensions.width], ['50%', '-50%']);
    const translateY2 = useTransform(mouseYSpring, [0, dimensions.height], ['50%', '-50%']);


    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div
                className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-red-600/30 blur-[150px] rounded-full"
                style={{ translateX: translateX1, translateY: translateY1 }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
                className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-red-900/40 blur-[150px] rounded-full"
                style={{ translateX: translateX2, translateY: translateY2 }}
                animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }}
            />
        </div>
    );
};


// --- Main Page Component ---
export default function Home() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // View state for the auth form: 'signIn', 'signUp', 'forgotPassword', 'updatePassword'
    const [view, setView] = useState('signUp');

    // Form state for all inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // This listener handles all auth events, making a separate session check redundant.
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setLoading(true);
                const currentUser = session?.user;
                setUser(currentUser ?? null);

                if (event === 'PASSWORD_RECOVERY') {
                    setView('updatePassword');
                } else if (currentUser) {
                    // If a user is logged in, fetch their profile.
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUser.id)
                        .single();
                    
                    if (profileError) {
                        console.error("Error fetching profile:", profileError.message);
                        setProfile(null);
                    } else {
                        setProfile(profileData ?? null);
                    }
                } else {
                    // If no user is logged in, clear the profile.
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            // Cleanup the listener when the component unmounts.
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            switch (view) {
                case 'signUp':
                    const { error: signUpError } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                first_name: firstName,
                                last_name: lastName,
                                roll_number: rollNumber,
                                phone_number: phoneNumber,
                                date_of_birth: dateOfBirth,
                                // Default role can be set here if needed, e.g., role: 'student'
                            },
                        },
                    });
                    if (signUpError) throw signUpError;
                    setMessage('Check your email for the confirmation link!');
                    break;
                case 'signIn':
                    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                    if (signInError) throw signInError;
                    // onAuthStateChange will handle the redirect/UI update
                    break;
                case 'forgotPassword':
                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}`,
                    });
                    if (resetError) throw resetError;
                    setMessage('Check your email for the password reset link!');
                    break;
                case 'updatePassword':
                    const { error: updateError } = await supabase.auth.updateUser({ password });
                    if (updateError) throw updateError;
                    setMessage('Password updated successfully! You can now sign in.');
                    setView('signIn');
                    break;
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSocialLogin = async (provider) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}` }
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };
    
    async function signOut() {
        await supabase.auth.signOut();
        // The onAuthStateChange listener will automatically clear user and profile state.
        setView('signIn');
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-black text-white">Loading...</div>;
    }

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4 font-sans">
            <InteractiveAurora />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

            {user && profile ? (
                profile.role === 'admin' ? (
                    <AdminDashboard user={user} profile={profile} signOut={signOut} />
                ) : (
                    <StudentDashboard user={user} profile={profile} signOut={signOut} />
                )
            ) : (
                <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-800/30 p-8 shadow-2xl backdrop-blur-lg">
                    <div className="relative z-20">
                        <AnimatePresence mode="wait">
                            <motion.form
                                key={view}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                onSubmit={handleAuthAction}
                                className="space-y-6"
                            >
                                <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center text-white tracking-wider">
                                    {view === 'signIn' && 'Sign In'}
                                    {view === 'signUp' && 'Create Account'}
                                    {view === 'forgotPassword' && 'Reset Password'}
                                    {view === 'updatePassword' && 'Update Password'}
                                </motion.h2>

                                {view === 'signUp' && (
                                    <>
                                        <motion.div variants={itemVariants} className="flex space-x-4">
                                            <AnimatedInput icon={<UserIcon />} type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                            <AnimatedInput icon={<UserIcon />} type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                        </motion.div>
                                        <motion.div variants={itemVariants}>
                                            <AnimatedInput icon={<IdIcon />} type="text" placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
                                        </motion.div>
                                        <motion.div variants={itemVariants}>
                                            <AnimatedInput icon={<PhoneIcon />} type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                                        </motion.div>
                                        <motion.div variants={itemVariants}>
                                            <AnimatedInput icon={<CalendarIcon />} type="date" placeholder="Date of Birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                                        </motion.div>
                                    </>
                                )}
                                
                                {(view === 'signIn' || view === 'signUp' || view === 'forgotPassword') && (
                                    <motion.div variants={itemVariants}>
                                        <AnimatedInput icon={<MailIcon />} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </motion.div>
                                )}

                                {(view === 'signIn' || view === 'signUp' || view === 'updatePassword') && (
                                    <motion.div variants={itemVariants}>
                                        <AnimatedInput icon={<LockClosedIcon />} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </motion.div>
                                )}

                                <motion.button
                                    variants={itemVariants}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50"
                                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(255, 0, 0, 0.6)" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {loading ? 'Loading...' : 
                                     view === 'signIn' ? 'Sign In' :
                                     view === 'signUp' ? 'Sign Up' :
                                     view === 'forgotPassword' ? 'Send Reset Link' :
                                     'Update Password'}
                                </motion.button>

                                {error && <p className="text-red-400 text-center">{error}</p>}
                                {message && <p className="text-green-400 text-center">{message}</p>}

                                <motion.div variants={itemVariants} className="text-center text-gray-400 text-sm space-y-2">
                                    {view === 'signIn' && (
                                        <>
                                            <p>
                                                Don&apos;t have an account?{' '}
                                                <button type="button" onClick={() => setView('signUp')} className="font-semibold text-red-400 hover:underline">Sign Up</button>
                                            </p>
                                            <p>
                                                <button type="button" onClick={() => setView('forgotPassword')} className="font-semibold text-red-400 hover:underline">Forgot Password?</button>
                                            </p>
                                        </>
                                    )}
                                    {(view === 'signUp' || view === 'forgotPassword') && (
                                        <p>
                                            Already have an account?{' '}
                                            <button type="button" onClick={() => setView('signIn')} className="font-semibold text-red-400 hover:underline">Sign In</button>
                                        </p>
                                    )}
                                </motion.div>

                                {(view === 'signIn' || view === 'signUp') && (
                                    <>
                                        <motion.div variants={itemVariants} className="relative flex py-2 items-center">
                                            <div className="flex-grow border-t border-gray-600"></div>
                                            <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                                            <div className="flex-grow border-t border-gray-600"></div>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="flex justify-center">
                                            <button type="button" onClick={() => handleSocialLogin('google')} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition">
                                                <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.863 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </motion.form>
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </main>
    );
}
