// frontend/src/app/components/AdminDashboard.js
"use client";

import { supabase } from "@/utils/supabase/client"; // Corrected import
import { useState, useEffect } from "react";

export default function AdminDashboard({ user, profile, signOut }) {
  // No need to call createClient() anymore, supabase is imported directly
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      // The RLS policy allows this query to work only for users with the 'admin' role.
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error fetching students:", error);
      } else {
        setStudents(data);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome, {profile.first_name}!</p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">All Student Profiles</h2>
        {loading ? (
          <p>Loading students...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-600">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Roll Number</th>
                  <th className="py-2">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-700">
                    <td className="py-2">{student.first_name} {student.last_name}</td>
                    <td className="py-2">{student.email}</td>
                    <td className="py-2">{student.roll_number}</td>
                    <td className="py-2">{student.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
