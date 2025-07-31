import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black to-red-900 p-24">
      <div className="w-full max-w-md p-8 space-y-8 bg-white bg-opacity-10 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white animate-subtle-bounce">
            JECRC University Result System
          </h1>
          <p className="mt-2 text-gray-300">
            Please log in to continue
          </p>
        </div>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-bold text-gray-300 block"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full p-3 mt-1 text-white bg-transparent border-b-2 border-gray-500 focus:border-red-500 focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-gray-300 block"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="w-full p-3 mt-1 text-white bg-transparent border-b-2 border-gray-500 focus:border-red-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <a
              href="#"
              className="text-sm text-red-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-3 font-bold text-white bg-red-700 rounded-lg hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transform hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}