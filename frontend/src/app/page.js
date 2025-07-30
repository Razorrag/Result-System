// src/app/page.js
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="text-center p-10 rounded-lg shadow-xl bg-white">
        <h1 className="text-4xl font-bold text-jecrc-maroon">
          JECRC University Result System
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Welcome! The system is under construction.
        </p>
        <div className="mt-6">
          <button className="bg-jecrc-maroon text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
            Admin Login
          </button>
          <button className="ml-4 bg-jecrc-gold text-jecrc-maroon font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
            Student Login
          </button>
        </div>
      </div>
    </main>
  )
}