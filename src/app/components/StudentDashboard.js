"use client";

import { motion } from 'framer-motion';

export default function StudentDashboard({ user, profile, signOut }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-800/30 p-8 shadow-2xl backdrop-blur-lg text-white"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-wider">Student Dashboard</h1>
        <button
          onClick={signOut}
          className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-gray-700/50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Welcome, {profile.first_name || user.email}!</h2>
        <p className="text-gray-300">Your results and academic information will be displayed here soon.</p>
        <p className="mt-4 text-sm text-gray-400">Role: <span className="font-mono bg-gray-600/50 px-2 py-1 rounded">{profile.role}</span></p>
      </div>
    </motion.div>
  );
}