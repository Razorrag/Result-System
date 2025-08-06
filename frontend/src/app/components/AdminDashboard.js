"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// --- Icon Components ---
const AiIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const TableIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M4 4h16v16H4z" />
  </svg>
);
const SqlIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 21h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
const PaperAirplaneIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);


const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');

export default function AdminDashboard({ user, profile, signOut }) {
  const [activeView, setActiveView] = useState('ai');
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to Real-Time Server!');
      // You can send a test event to verify the connection
      socket.emit('test-event', { userId: user.id, role: profile.role });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from Real-Time Server!');
    });

    socket.on('test-response', (data) => {
      console.log('Test response from server:', data.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('test-response');
    };
  }, [user.id, profile.role]);

  const SidebarButton = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
        activeView === view
          ? 'bg-red-600 text-white'
          : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-screen flex bg-gray-900 text-white font-sans"
    >
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-wider">JECRC Panel</h1>
            <p className="text-sm text-gray-400">Admin</p>
        </div>
        <nav className="flex-grow space-y-2">
            <SidebarButton view="ai" label="AI Assistant" icon={<AiIcon className="w-5 h-5" />} />
            <SidebarButton view="tables" label="Tables" icon={<TableIcon className="w-5 h-5" />} />
            <SidebarButton view="sql" label="SQL Editor" icon={<SqlIcon className="w-5 h-5" />} />
        </nav>
        <div className="mt-auto">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-jecrc-maroon rounded-full flex items-center justify-center font-bold">
                    {profile?.first_name?.[0] || user.email[0]}
                </div>
                <div className="ml-3">
                    <p className="font-semibold">{profile.first_name || 'Admin'}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                </div>
            </div>
            <button
              onClick={signOut}
              className="w-full bg-red-700/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Sign Out
            </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold capitalize">{activeView} View</h2>
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
        </div>

        <div className="flex-1 bg-gray-800/50 rounded-lg p-4 border border-white/10 flex flex-col">
            {activeView === 'ai' && <AIAssistantView />}
            {activeView === 'tables' && <div className="text-center p-10">Table viewer coming soon.</div>}
            {activeView === 'sql' && <div className="text-center p-10">SQL editor coming soon.</div>}
        </div>
      </main>
    </motion.div>
  );
}

// --- AI Assistant View Component (kept in same file for simplicity) ---
const AIAssistantView = () => {
    const [messages, setMessages] = useState([{text: "Hello! I am your secure SQL assistant. How can I help you query the database today?", sender: 'ai'}]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        // This will be replaced with WebSocket logic in Phase 3
        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        // Placeholder for AI response
        setTimeout(() => {
            const aiResponse = { text: `Query received: "${input}". Processing...`, sender: 'ai' };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);

        setInput('');
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-xl px-4 py-2 rounded-lg ${msg.sender === 'ai' ? 'bg-gray-700' : 'bg-red-600'}`}>
                           <p className="text-sm">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 'Show me all students with a roll number starting with 21'"
                    className="flex-1 bg-gray-700 text-white rounded-l-lg p-3 outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-r-lg"
                >
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};