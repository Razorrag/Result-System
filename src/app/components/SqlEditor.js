"use client";

import { useState } from 'react';

export default function SqlEditor({ onRunQuery, isLoading }) {
  const [query, setQuery] = useState('SELECT * FROM profiles LIMIT 10;');

  const handleRun = () => {
    if (!query.trim() || isLoading) return;
    onRunQuery(query);
  };

  return (
    <div className="h-full flex flex-col p-4 text-white">
      <h3 className="text-xl font-semibold mb-4">Manual SQL Editor</h3>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 w-full p-3 bg-gray-900 rounded-lg border border-gray-600 font-mono text-sm resize-none outline-none focus:ring-2 focus:ring-red-500"
        placeholder="Enter your SQL query here..."
      />
      <button
        onClick={handleRun}
        disabled={isLoading}
        className="mt-4 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 hover:bg-red-700"
      >
        {isLoading ? 'Executing...' : 'Run Query'}
      </button>
    </div>
  );
}