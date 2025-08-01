// frontend/src/app/components/StudentDashboard.js
"use client";

// No Supabase import is needed here if all data is passed via props.
// If you add direct Supabase calls later, you would add:
// import { supabase } from "@/utils/supabase/client";

export default function StudentDashboard({ user, profile, signOut }) {
  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
            Sign Out
            </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg text-left">
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome, {profile.first_name}!</h2>
            <p className="mb-2"><span className="font-semibold">Name:</span> {profile.first_name} {profile.last_name}</p>
            <p className="mb-2"><span className="font-semibold">Email:</span> {profile.email}</p>
            <p className="mb-2"><span className="font-semibold">Roll No:</span> {profile.roll_number}</p>
            <p className="mb-2"><span className="font-semibold">Phone:</span> {profile.phone_number}</p>
            <p className="mb-4"><span className="font-semibold">DOB:</span> {profile.date_of_birth}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mt-6">
             <h2 className="text-2xl font-bold mb-4">My Results</h2>
             <p className="text-gray-400">Result information will be displayed here once available.</p>
        </div>
    </div>
  );
}
